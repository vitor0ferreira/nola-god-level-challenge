"use client"

import { useState, useMemo } from "react"
import { AnalysisFocusSidebar, type AnalysisFocus } from "@/components/analysis-focus-sidebar"
import { SecondaryFilters } from "@/components/secondary-filters"
import { AutomaticInsightsSection } from "@/components/automatic-insights-section"
import { MetricCard } from "@/components/metric-card"
import { RevenueChart } from "@/components/revenue-chart"
import { ComparisonChart } from "@/components/comparison-chart"
import { TopProductsTable } from "@/components/top-products-table"
import { mockSales } from "@/lib/mock-data"
import {
  filterSales,
  calculateTotalRevenue,
  calculateAverageTicket,
  calculateTotalOrders,
  calculateMetricWithComparison,
  getRevenueByDay,
  getRevenueByChannel,
  getRevenueByStore,
  getTopProducts,
  getPeriodDates,
  getPreviousPeriodDates,
  formatCurrency,
  formatNumber,
  aggregateByDimension,
} from "@/lib/calculations"
import { generateInsights } from "@/lib/insights"

export default function DashboardPage() {
  const [analysisFocus, setAnalysisFocus] = useState<AnalysisFocus>("geral")

  const [period, setPeriod] = useState("month")
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)

  const { currentSales, previousSales, insights, metrics, charts } = useMemo(() => {
    const { startDate, endDate } = getPeriodDates(period)
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriodDates(startDate, endDate)

    const currentFiltered = filterSales(mockSales, {
      startDate,
      endDate,
      storeIds: selectedStore ? [selectedStore] : undefined,
      channelIds: selectedChannel ? [selectedChannel] : undefined,
    })

    const previousFiltered = filterSales(mockSales, {
      startDate: prevStartDate,
      endDate: prevEndDate,
      storeIds: selectedStore ? [selectedStore] : undefined,
      channelIds: selectedChannel ? [selectedChannel] : undefined,
    })

    const revenueMetric = calculateMetricWithComparison(currentFiltered, previousFiltered, calculateTotalRevenue)
    const ticketMetric = calculateMetricWithComparison(currentFiltered, previousFiltered, calculateAverageTicket)
    const ordersMetric = calculateMetricWithComparison(currentFiltered, previousFiltered, calculateTotalOrders)

    const insightsData = generateInsights(currentFiltered, previousFiltered)
    const revenueByDay = getRevenueByDay(currentFiltered)
    const revenueByChannel = getRevenueByChannel(currentFiltered)
    const revenueByStore = getRevenueByStore(currentFiltered)
    const topProducts = getTopProducts(currentFiltered, 10)

    return {
      currentSales: currentFiltered,
      previousSales: previousFiltered,
      insights: insightsData,
      metrics: {
        revenue: revenueMetric,
        ticket: ticketMetric,
        orders: ordersMetric,
      },
      charts: {
        revenueByDay,
        revenueByChannel,
        revenueByStore,
        topProducts,
      },
    }
  }, [period, selectedStore, selectedChannel])

  const focusContent = useMemo(() => {
    switch (analysisFocus) {
      case "geral":
        return {
          title: "Visão Geral do Negócio",
          description: "Panorama completo de todas as operações",
          charts: [
            {
              component: <RevenueChart key="revenue-day" data={charts.revenueByDay} title="Evolução do Faturamento" />,
            },
            {
              component: (
                <div key="comparisons" className="grid gap-4 lg:grid-cols-2">
                  <ComparisonChart data={charts.revenueByChannel} title="Faturamento por Canal" />
                  <ComparisonChart data={charts.revenueByStore} title="Faturamento por Loja" />
                </div>
              ),
            },
          ],
        }

      case "lojas":
        return {
          title: "Análise por Lojas",
          description: selectedStore
            ? `Dados específicos da loja selecionada`
            : "Compare a performance entre diferentes lojas",
          charts: [
            { component: <ComparisonChart key="stores" data={charts.revenueByStore} title="Comparação de Lojas" /> },
            {
              component: <RevenueChart key="revenue-day" data={charts.revenueByDay} title="Evolução do Faturamento" />,
            },
            {
              component: (
                <TopProductsTable key="top-products" products={charts.topProducts} title="Top 10 Produtos da Loja" />
              ),
            },
          ],
        }

      case "produtos":
        return {
          title: "Análise de Produtos",
          description: "Performance e tendências dos produtos vendidos",
          charts: [
            {
              component: (
                <TopProductsTable
                  key="top-products"
                  products={charts.topProducts}
                  title="Top 10 Produtos Mais Vendidos"
                />
              ),
            },
            {
              component: (
                <ComparisonChart
                  key="products-channel"
                  data={aggregateByDimension(currentSales, "revenue", "product")
                    .slice(0, 10)
                    .map((d) => ({
                      date: d.name,
                      value: d.value,
                      label: d.name,
                    }))}
                  title="Faturamento por Produto"
                />
              ),
            },
          ],
        }

      case "canais":
        return {
          title: "Análise de Canais de Venda",
          description: "Compare delivery, presencial e outros canais",
          charts: [
            {
              component: (
                <ComparisonChart key="channels" data={charts.revenueByChannel} title="Faturamento por Canal" />
              ),
            },
            {
              component: <RevenueChart key="revenue-day" data={charts.revenueByDay} title="Evolução do Faturamento" />,
            },
          ],
        }

      case "temporal":
        return {
          title: "Análise Temporal",
          description: "Tendências e padrões ao longo do tempo",
          charts: [
            { component: <RevenueChart key="revenue-day" data={charts.revenueByDay} title="Evolução Diária" /> },
            {
              component: (
                <ComparisonChart
                  key="by-hour"
                  data={aggregateByDimension(currentSales, "revenue", "hour").map((d) => ({
                    date: d.name,
                    value: d.value,
                    label: d.name,
                  }))}
                  title="Faturamento por Hora do Dia"
                />
              ),
            },
            {
              component: (
                <ComparisonChart
                  key="by-weekday"
                  data={aggregateByDimension(currentSales, "revenue", "weekday").map((d) => ({
                    date: d.name,
                    value: d.value,
                    label: d.name,
                  }))}
                  title="Faturamento por Dia da Semana"
                />
              ),
            },
          ],
        }

      case "clientes":
        return {
          title: "Análise de Clientes",
          description: "Comportamento e padrões de compra dos clientes",
          charts: [
            {
              component: <RevenueChart key="revenue-day" data={charts.revenueByDay} title="Evolução do Faturamento" />,
            },
          ],
        }

      default:
        return {
          title: "Visão Geral",
          description: "Panorama do negócio",
          charts: [],
        }
    }
  }, [analysisFocus, selectedStore, charts, currentSales])

  return (
    <div className="flex min-h-screen bg-background">
      <AnalysisFocusSidebar selectedFocus={analysisFocus} onFocusChange={setAnalysisFocus} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold">Dashboard - Restaurante Maria</h1>
            <p className="text-sm text-muted-foreground">{focusContent.description}</p>
          </div>
        </header>

        <SecondaryFilters
          focus={analysisFocus}
          period={period}
          onPeriodChange={setPeriod}
          storeId={selectedStore}
          onStoreChange={setSelectedStore}
          channelId={selectedChannel}
          onChannelChange={setSelectedChannel}
          productId={selectedProduct}
          onProductChange={setSelectedProduct}
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-6 space-y-6">
            {/* Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Faturamento Total"
                value={formatCurrency(metrics.revenue.value)}
                change={metrics.revenue.change}
                trend={metrics.revenue.trend}
                subtitle="vs período anterior"
              />
              <MetricCard
                title="Ticket Médio"
                value={formatCurrency(metrics.ticket.value)}
                change={metrics.ticket.change}
                trend={metrics.ticket.trend}
                subtitle="por pedido"
              />
              <MetricCard
                title="Total de Pedidos"
                value={formatNumber(metrics.orders.value)}
                change={metrics.orders.change}
                trend={metrics.orders.trend}
                subtitle="pedidos concluídos"
              />
            </div>

            <AutomaticInsightsSection insights={insights} />

            <div className="space-y-6">
              {focusContent.charts.map((chart, index) => (
                <div key={index}>{chart.component}</div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
