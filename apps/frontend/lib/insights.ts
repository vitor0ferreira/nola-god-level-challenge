import type { ChartDataPoint } from "@/lib/database"

export interface Insight {
  id: string
  type: "positive" | "negative" | "neutral" | "warning"
  title: string
  description: string
  value?: string
  change?: number
}

export function generateInsights(
  currentKpis: any, 
  previousKpis: any,
  channelRevenue: ChartDataPoint[] = [],
  prevChannelRevenue: ChartDataPoint[] = [],
  storeRevenue: ChartDataPoint[] = [],
  prevStoreRevenue: ChartDataPoint[] = []
): Insight[] {
  const insights: Insight[] = []

  if (currentKpis && previousKpis) {
    const currentRevenue = currentKpis.total_revenue
    const previousRevenue = previousKpis.total_revenue
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    if (Math.abs(revenueChange) > 5) {
      insights.push({
        id: "revenue-change",
        type: revenueChange > 0 ? "positive" : "negative",
        title: revenueChange > 0 ? "Faturamento em alta" : "Queda no faturamento",
        description: `O faturamento ${revenueChange > 0 ? "cresceu" : "caiu"} ${Math.abs(revenueChange).toFixed(1)}% em relação ao período anterior`,
        change: revenueChange,
      })
    }
    
    const currentOrders = currentKpis.total_sales
    const previousOrders = previousKpis.total_sales
    const orderChange =
      previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0

    if (Math.abs(orderChange) > 10) {
      insights.push({
        id: "order-volume",
        type: orderChange > 0 ? "positive" : "warning",
        title: `Volume de pedidos ${orderChange > 0 ? "aumentou" : "diminuiu"}`,
        description: `${Math.abs(orderChange).toFixed(1)}% ${orderChange > 0 ? "mais" : "menos"} pedidos que o período anterior`,
        change: orderChange,
      })
    }
  }

  channelRevenue.forEach((current) => {
    const previous = prevChannelRevenue.find((p) => p.label === current.label)
    if (previous && previous.value > 0) {
      const change = ((current.value - previous.value) / previous.value) * 100
      if (Math.abs(change) > 15) {
        insights.push({
          id: `channel-${current.label}`,
          type: change > 0 ? "positive" : "warning",
          title: `${current.label} ${change > 0 ? "em crescimento" : "precisa de atenção"}`,
          description: `${change > 0 ? "Crescimento" : "Queda"} de ${Math.abs(change).toFixed(1)}% nas vendas`,
          change,
        })
      }
    }
  })

  storeRevenue.forEach((current) => {
    const previous = prevStoreRevenue.find((p) => p.label === current.label)
    if (previous && previous.value > 0) {
      const change = ((current.value - previous.value) / previous.value) * 100
      if (Math.abs(change) > 20) {
        insights.push({
          id: `store-${current.label}`,
          type: change > 0 ? "positive" : "warning",
          title: `${current.label}: ${change > 0 ? "Destaque" : "Atenção necessária"}`,
          description: `Performance ${change > 0 ? "acima" : "abaixo"} da média (${Math.abs(change).toFixed(1)}%)`,
          change,
        })
      }
    }
  })

  return insights.sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0)).slice(0, 5)
}