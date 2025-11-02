import type { Sale, MetricData, ChartDataPoint, TopProduct } from "@/lib/database"
import { mockStores, mockChannels, mockProducts, mockProductSalesMap } from "@/lib/mock-data"

export interface FilterOptions {
  startDate?: Date
  endDate?: Date
  storeIds?: number[]
  channelIds?: number[]
  productIds?: number[]
}

export function filterSales(sales: Sale[], filters: FilterOptions): Sale[] {
  return sales.filter((sale) => {
    if (filters.startDate && sale.created_at < filters.startDate) return false
    if (filters.endDate && sale.created_at > filters.endDate) return false
    if (filters.storeIds && filters.storeIds.length > 0 && !filters.storeIds.includes(sale.store_id)) return false
    if (filters.channelIds && filters.channelIds.length > 0 && !filters.channelIds.includes(sale.channel_id))
      return false

    // Only completed sales
    if (sale.sale_status_desc !== "Concluído") return false

    return true
  })
}

export function calculateTotalRevenue(sales: Sale[]): number {
  return sales.reduce((sum, sale) => sum + sale.total_amount, 0)
}

export function calculateAverageTicket(sales: Sale[]): number {
  if (sales.length === 0) return 0
  return calculateTotalRevenue(sales) / sales.length
}

export function calculateTotalOrders(sales: Sale[]): number {
  return sales.length
}

export function calculateMetricWithComparison(
  currentSales: Sale[],
  previousSales: Sale[],
  calculator: (sales: Sale[]) => number,
): MetricData {
  const currentValue = calculator(currentSales)
  const previousValue = calculator(previousSales)

  const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
  const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral"

  return {
    label: "",
    value: currentValue,
    change: Math.abs(change),
    trend,
  }
}

export function getRevenueByDay(sales: Sale[]): ChartDataPoint[] {
  const revenueMap = new Map<string, number>()

  sales.forEach((sale) => {
    const dateKey = sale.created_at.toISOString().split("T")[0]
    revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + sale.total_amount)
  })

  return Array.from(revenueMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getRevenueByChannel(sales: Sale[]): ChartDataPoint[] {
  const revenueMap = new Map<number, number>()

  sales.forEach((sale) => {
    revenueMap.set(sale.channel_id, (revenueMap.get(sale.channel_id) || 0) + sale.total_amount)
  })

  return Array.from(revenueMap.entries())
    .map(([channelId, value]) => ({
      date: mockChannels.find((c) => c.id === channelId)?.name || `Canal ${channelId}`,
      value,
      label: mockChannels.find((c) => c.id === channelId)?.name || `Canal ${channelId}`,
    }))
    .sort((a, b) => b.value - a.value)
}

export function getRevenueByStore(sales: Sale[]): ChartDataPoint[] {
  const revenueMap = new Map<number, number>()

  sales.forEach((sale) => {
    revenueMap.set(sale.store_id, (revenueMap.get(sale.store_id) || 0) + sale.total_amount)
  })

  return Array.from(revenueMap.entries())
    .map(([storeId, value]) => ({
      date: mockStores.find((s) => s.id === storeId)?.name || `Loja ${storeId}`,
      value,
      label: mockStores.find((s) => s.id === storeId)?.name || `Loja ${storeId}`,
    }))
    .sort((a, b) => b.value - a.value)
}

export function getTopProducts(sales: Sale[], limit = 10): TopProduct[] {
  const productMap = new Map<number, { quantity: number; revenue: number; orders: number }>()

  sales.forEach((sale) => {
    const productIds = mockProductSalesMap.get(sale.id) || []
    productIds.forEach((productId) => {
      const current = productMap.get(productId) || { quantity: 0, revenue: 0, orders: 0 }
      const itemRevenue = sale.total_amount_items / productIds.length // Simplified

      productMap.set(productId, {
        quantity: current.quantity + 1,
        revenue: current.revenue + itemRevenue,
        orders: current.orders + 1,
      })
    })
  })

  return Array.from(productMap.entries())
    .map(([productId, data]) => ({
      product_id: productId,
      product_name: mockProducts.find((p) => p.id === productId)?.name || `Produto ${productId}`,
      total_quantity: data.quantity,
      total_revenue: data.revenue,
      order_count: data.orders,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit)
}

export function getPeriodDates(period: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date(now)

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0)
      break
    case "yesterday":
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
      break
    case "week":
      startDate.setDate(startDate.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
      break
    case "month":
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
      break
    case "quarter":
      startDate.setDate(startDate.getDate() - 90)
      startDate.setHours(0, 0, 0, 0)
      break
    default:
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
  }

  return { startDate, endDate }
}

export function getPreviousPeriodDates(startDate: Date, endDate: Date): { startDate: Date; endDate: Date } {
  const periodLength = endDate.getTime() - startDate.getTime()

  const prevEndDate = new Date(startDate.getTime() - 1)
  const prevStartDate = new Date(prevEndDate.getTime() - periodLength)

  return { startDate: prevStartDate, endDate: prevEndDate }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function aggregateByDimension(
  sales: Sale[],
  metric: string,
  dimension: string,
): Array<{ name: string; value: number }> {
  const aggregationMap = new Map<string, { sum: number; count: number; totalTime: number }>()

  sales.forEach((sale) => {
    let key = ""

    switch (dimension) {
      case "day":
        key = sale.created_at.toISOString().split("T")[0]
        break
      case "month":
        key = `${sale.created_at.getFullYear()}-${String(sale.created_at.getMonth() + 1).padStart(2, "0")}`
        break
      case "store":
        key = mockStores.find((s) => s.id === sale.store_id)?.name || `Loja ${sale.store_id}`
        break
      case "channel":
        key = mockChannels.find((c) => c.id === sale.channel_id)?.name || `Canal ${sale.channel_id}`
        break
      case "hour":
        key = `${sale.created_at.getHours()}h`
        break
      case "weekday":
        const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
        key = days[sale.created_at.getDay()]
        break
      case "product":
        const productIds = mockProductSalesMap.get(sale.id) || []
        productIds.forEach((productId) => {
          const productKey = mockProducts.find((p) => p.id === productId)?.name || `Produto ${productId}`
          const current = aggregationMap.get(productKey) || { sum: 0, count: 0, totalTime: 0 }
          const itemValue = sale.total_amount_items / productIds.length

          aggregationMap.set(productKey, {
            sum: current.sum + itemValue,
            count: current.count + 1,
            totalTime: current.totalTime + (sale.production_seconds || 0),
          })
        })
        return Array.from(aggregationMap.entries())
          .map(([name, data]) => ({
            name,
            value: getMetricValue(metric, data.sum, data.count, data.totalTime),
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
      default:
        key = "Outros"
    }

    const current = aggregationMap.get(key) || { sum: 0, count: 0, totalTime: 0 }

    aggregationMap.set(key, {
      sum: current.sum + sale.total_amount,
      count: current.count + 1,
      totalTime: current.totalTime + (sale.production_seconds || 0) + (sale.delivery_seconds || 0),
    })
  })

  const result = Array.from(aggregationMap.entries()).map(([name, data]) => ({
    name,
    value: getMetricValue(metric, data.sum, data.count, data.totalTime),
  }))

  // Sort appropriately
  if (dimension === "day" || dimension === "month") {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    result.sort((a, b) => b.value - a.value)
  }

  return result
}

function getMetricValue(metric: string, sum: number, count: number, totalTime: number): number {
  switch (metric) {
    case "revenue":
      return sum
    case "orders":
      return count
    case "ticket":
      return count > 0 ? sum / count : 0
    case "discount":
      return count > 0 ? sum / count : 0
    case "production_time":
      return count > 0 ? totalTime / count / 60 : 0 // Convert to minutes
    case "delivery_time":
      return count > 0 ? totalTime / count / 60 : 0
    case "quantity":
      return count
    default:
      return sum
  }
}

export function getReportData(reportId: string, sales: Sale[]) {
  switch (reportId) {
    case "top-products-delivery": {
      const deliverySales = sales.filter((s) => {
        const channel = mockChannels.find((c) => c.id === s.channel_id)
        return channel?.type === "D"
      })
      return getTopProducts(deliverySales, 10)
    }

    case "store-comparison": {
      const storeMap = new Map<number, { revenue: number; orders: number }>()
      sales.forEach((sale) => {
        const current = storeMap.get(sale.store_id) || { revenue: 0, orders: 0 }
        storeMap.set(sale.store_id, {
          revenue: current.revenue + sale.total_amount,
          orders: current.orders + 1,
        })
      })

      return Array.from(storeMap.entries())
        .map(([storeId, data]) => ({
          name: mockStores.find((s) => s.id === storeId)?.name || `Loja ${storeId}`,
          value: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => b.value - a.value)
    }

    case "peak-hours": {
      const hourMap = new Map<number, { revenue: number; orders: number }>()
      sales.forEach((sale) => {
        const hour = sale.created_at.getHours()
        const current = hourMap.get(hour) || { revenue: 0, orders: 0 }
        hourMap.set(hour, {
          revenue: current.revenue + sale.total_amount,
          orders: current.orders + 1,
        })
      })

      return Array.from(hourMap.entries())
        .map(([hour, data]) => ({
          hour: `${hour}:00`,
          value: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => {
          const hourA = Number.parseInt(a.hour)
          const hourB = Number.parseInt(b.hour)
          return hourA - hourB
        })
    }

    case "channel-performance": {
      const channelMap = new Map<number, { revenue: number; orders: number }>()
      sales.forEach((sale) => {
        const current = channelMap.get(sale.channel_id) || { revenue: 0, orders: 0 }
        channelMap.set(sale.channel_id, {
          revenue: current.revenue + sale.total_amount,
          orders: current.orders + 1,
        })
      })

      return Array.from(channelMap.entries()).map(([channelId, data]) => {
        const channel = mockChannels.find((c) => c.id === channelId)
        return {
          name: channel?.name || `Canal ${channelId}`,
          type: channel?.type || "P",
          revenue: data.revenue,
          avgTicket: data.orders > 0 ? data.revenue / data.orders : 0,
          orders: data.orders,
        }
      })
    }

    default:
      return []
  }
}
