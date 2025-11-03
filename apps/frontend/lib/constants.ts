export const metricLabels: Record<string, string> = {
  revenue: "Faturamento Total",
  orders: "Quantidade de Pedidos",
  ticket: "Ticket Médio",
  discount: "Desconto Médio",
  quantity: "Quantidade Vendida",
  production_time: "Tempo de Preparo",
  delivery_time: "Tempo de Entrega",
}

export const dimensionLabels: Record<string, string> = {
  day: "Por Dia",
  month: "Por Mês",
  store: "Por Loja",
  channel: "Por Canal",
  product: "Por Produto",
  category: "Por Categoria",
  hour: "Por Hora do Dia",
  weekday: "Por Dia da Semana",
  payment_type: "Por Forma de Pagamento",
}

export const metricDescriptions: Record<string, string> = {
  revenue: "Soma do valor total das vendas",
  orders: "Número total de pedidos",
  ticket: "Valor médio por pedido",
  discount: "Valor médio de desconto aplicado",
  quantity: "Total de produtos vendidos",
  production_time: "Tempo médio de produção em minutos",
  delivery_time: "Tempo médio de entrega em minutos",
}

export const dimensionDescriptions: Record<string, string> = {
  day: "Agrupa os dados por dia",
  month: "Agrupa os dados por mês",
  store: "Compara entre lojas",
  channel: "Compara entre canais de venda",
  product: "Ranking de produtos",
  category: "Agrupa por categoria de produto",
  hour: "Identifica horários de pico",
  weekday: "Compara dias da semana",
  payment_type: "Compara formas de pagamento",
}

export const chartTypes = [
  { value: "bar", label: "Barras", description: "Ideal para comparações entre categorias" },
  { value: "line", label: "Linha", description: "Melhor para tendências ao longo do tempo" },
  { value: "pie", label: "Pizza", description: "Ótimo para mostrar proporções do todo" },
] as const