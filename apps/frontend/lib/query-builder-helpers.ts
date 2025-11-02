import { Prisma } from '@prisma/client'

export type MetricType = 
  | "revenue" | "orders" | "ticket" | "discount" 
  | "production_time" | "delivery_time" | "quantity"

export type DimensionType =
  | "day" | "month" | "store" | "channel" | "product"
  | "category" | "hour" | "weekday" | "payment_type"


export const metricLabels: Record<MetricType, string> = {
  revenue: "Faturamento",
  orders: "Pedidos",
  ticket: "Ticket Médio",
  discount: "Desconto Médio",
  production_time: "Tempo de Preparo",
  delivery_time: "Tempo de Entrega",
  quantity: "Quantidade",
}

export const dimensionLabels: Record<DimensionType, string> = {
  day: "Dia",
  month: "Mês",
  store: "Loja",
  channel: "Canal",
  product: "Produto",
  category: "Categoria",
  hour: "Hora do Dia",
  weekday: "Dia da Semana",
  payment_type: "Tipo de Pagamento",
}

const metrics: Record<MetricType, { sql: string }> = {
  revenue:          { sql: 'SUM(s.total_amount)' },
  orders:           { sql: 'COUNT(s.id)' },
  ticket:           { sql: 'AVG(s.total_amount)' },
  discount:         { sql: 'AVG(s.total_discount)' },
  production_time:  { sql: 'AVG(s.production_seconds)' },
  delivery_time:    { sql: 'AVG(s.delivery_seconds)' },
  quantity:         { sql: 'SUM(ps.quantity)' },
}

const dimensions: Record<DimensionType, { sql: string; tables: string[] }> = {
  day:          { sql: "DATE_TRUNC('day', s.created_at)", tables: ['sales'] },
  month:        { sql: "DATE_TRUNC('month', s.created_at)", tables: ['sales'] },
  hour:         { sql: "EXTRACT(HOUR FROM s.created_at)", tables: ['sales'] },
  weekday:      { sql: "EXTRACT(ISODOW FROM s.created_at)", tables: ['sales'] },// 1=Seg, 7=Dom
  store:        { sql: 'st.name', tables: ['sales', 'stores'] },
  channel:      { sql: 'c.name', tables: ['sales', 'channels'] },
  product:      { sql: 'p.name', tables: ['sales', 'product_sales', 'products'] },
  category:     { sql: 'cat.name', tables: ['sales', 'product_sales', 'products', 'categories'] },
  payment_type: { sql: 'pt.description', tables: ['sales', 'payments', 'payment_types'] },
}

const JOIN_CLAUSES: Record<string, string> = {
  stores:        'JOIN stores st ON st.id = s.store_id',
  channels:      'JOIN channels c ON c.id = s.channel_id',
  product_sales: 'JOIN product_sales ps ON ps.sale_id = s.id',
  products:      'JOIN products p ON p.id = ps.product_id',
  categories:    'LEFT JOIN categories cat ON cat.id = p.category_id',
  payments:      'JOIN payments pmt ON pmt.sale_id = s.id',
  payment_types: 'JOIN payment_types pt ON pt.id = pmt.payment_type_id',
}

function formatDimensionLabel(dimension: DimensionType, value: any): string {
  if (dimension === 'hour') return `${value}h`
  if (dimension === 'weekday') {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    return days[value - 1] || 'Inválido'
  }
  if (dimension === 'day' || dimension === 'month') {
    return new Date(value).toLocaleDateString('pt-BR', {
      year: dimension === 'month' ? 'numeric' : undefined,
      month: 'short',
      day: dimension === 'day' ? 'numeric' : undefined,
      timeZone: 'UTC'
    })
  }
  return String(value)
}


export function buildDynamicQuery(
  metricId: MetricType,
  dimensionId: DimensionType,
  startDate: string,
  endDate: string,
  storeIdArray: number[] | null,
  channelIdArray: number[] | null
) {
  const metric = metrics[metricId]
  const dimension = dimensions[dimensionId]

  if (!metric || !dimension) {
    throw new Error('Métrica ou dimensão inválida.')
  }

  let requiredTables = new Set(['sales'])
  dimension.tables.forEach(t => requiredTables.add(t))
  if (metricId === 'quantity') {
    requiredTables.add('product_sales')
  }

  let joins = ''
  for (const table of Object.keys(JOIN_CLAUSES)) {
    if (requiredTables.has(table) && table !== 'sales') {
      joins += `\n${JOIN_CLAUSES[table]}`
    }
  }

  let whereClauses = [
    `s.created_at BETWEEN $1::timestamp AND $2::timestamp`,
    `s.sale_status_desc = 'COMPLETED'`
  ]
  let params: any[] = [startDate, endDate]

  if (storeIdArray) {
    whereClauses.push(`s.store_id = ANY($${params.length + 1}::int[])`)
    params.push(storeIdArray)
  }
  if (channelIdArray) {
    whereClauses.push(`s.channel_id = ANY($${params.length + 1}::int[])`)
    params.push(channelIdArray)
  }

  if (metricId === 'production_time') whereClauses.push('s.production_seconds IS NOT NULL')
  if (metricId === 'delivery_time') whereClauses.push('s.delivery_seconds IS NOT NULL')

  const sql = `
    SELECT
      ${dimension.sql} AS name,
      ${metric.sql} AS value
    FROM sales s
    ${joins}
    WHERE
      ${whereClauses.join(' AND \n')}
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 50; -- Limite de segurança
  `
  
  return { sql, params, formatLabel: (val: any) => formatDimensionLabel(dimensionId, val) }
}