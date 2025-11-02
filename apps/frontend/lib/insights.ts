import type { Sale } from "@/lib/database"
import { calculateTotalRevenue, getRevenueByChannel, getRevenueByStore } from "./calculations"

export interface Insight {
  id: string
  type: "positive" | "negative" | "neutral" | "warning"
  title: string
  description: string
  value?: string
  change?: number
}

export function generateInsights(currentSales: Sale[], previousSales: Sale[]): Insight[] {
  const insights: Insight[] = []

  // Revenue comparison
  const currentRevenue = calculateTotalRevenue(currentSales)
  const previousRevenue = calculateTotalRevenue(previousSales)
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

  // Channel performance
  const channelRevenue = getRevenueByChannel(currentSales)
  const prevChannelRevenue = getRevenueByChannel(previousSales)

  channelRevenue.forEach((current) => {
    const previous = prevChannelRevenue.find((p) => p.label === current.label)
    if (previous) {
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

  // Store performance
  const storeRevenue = getRevenueByStore(currentSales)
  const prevStoreRevenue = getRevenueByStore(previousSales)

  storeRevenue.forEach((current) => {
    const previous = prevStoreRevenue.find((p) => p.label === current.label)
    if (previous) {
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

  // Order volume
  const orderChange =
    previousSales.length > 0 ? ((currentSales.length - previousSales.length) / previousSales.length) * 100 : 0

  if (Math.abs(orderChange) > 10) {
    insights.push({
      id: "order-volume",
      type: orderChange > 0 ? "positive" : "warning",
      title: `Volume de pedidos ${orderChange > 0 ? "aumentou" : "diminuiu"}`,
      description: `${Math.abs(orderChange).toFixed(1)}% ${orderChange > 0 ? "mais" : "menos"} pedidos que o período anterior`,
      change: orderChange,
    })
  }

  // Limit to top 5 insights
  return insights.slice(0, 5)
}
