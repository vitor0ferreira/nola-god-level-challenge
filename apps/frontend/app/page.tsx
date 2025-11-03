"use client"

import { useState, useMemo } from "react"
import useSWR from 'swr'

import { AnalysisFocusSidebar, type AnalysisFocus } from "@/components/analysis-focus-sidebar"
import { SecondaryFilters } from "@/components/secondary-filters"
import { AutomaticInsightsSection } from "@/components/automatic-insights-section"
import { MetricCard } from "@/components/metric-card"
import { RevenueChart } from "@/components/revenue-chart"
import { ComparisonChart } from "@/components/comparison-chart"
import { TopProductsTable } from "@/components/top-products-table"
import { QueryBuilder, MetricType, DimensionType, ChartType } from "@/components/query-builder"
import { DynamicChart } from "@/components/dynamic-chart"

import {
  getPeriodDates,
  getPreviousPeriodDates,
  formatCurrency,
  formatNumber,
} from "@/lib/calculations"
import { fetcher } from '@/lib/fetcher'
import { generateInsights } from "@/lib/insights"
import { ChartDataPoint } from "@/lib/database"
import { metricLabels, dimensionLabels } from "@/lib/constants"

type FiltersResponse = {
  stores:{
    id: number,
    name: string
  }[],
  channels: {
    id: number,
    name: string
  }[],
  products: {
    id: number,
    name: string
  }[]
}

type KpisResponse = {
  total_revenue: number
  total_sales: number
  avg_ticket: number
  total_discount: number
  total_cancelled: number
}
type ChartResponse = {
  name: string
  value: number
  label?: string
}[]
type TopProductsResponse = {
  product_name: string
  product_id: number
  total_quantity: number
  total_revenue: number
  order_count: number
}[]


export default function DashboardPage() {
  const [analysisFocus, setAnalysisFocus] = useState<AnalysisFocus>("geral")

  const [period, setPeriod] = useState("month")
  const [selectedStores, setSelectedStores] = useState<number[]>([])
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)


  const [customQuery, setCustomQuery] = useState<{
    metric: MetricType
    dimension: DimensionType
    chartType: ChartType
  } | null>(null)

  const [isQueryBuilderVisible, setIsQueryBuilderVisible] = useState(false)

  const { startDate: rawStartDate, endDate: rawEndDate } = getPeriodDates(period)

  const { data: metaLastDate } = useSWR<{ lastDate: string | null }>(`/api/meta/last-date`, fetcher)

  const { startDate, endDate } = useMemo(() => {
    if (!metaLastDate || !metaLastDate.lastDate) return { startDate: rawStartDate, endDate: rawEndDate }
    const last = new Date(metaLastDate.lastDate)

    if (rawEndDate.getTime() <= last.getTime()) return { startDate: rawStartDate, endDate: rawEndDate }

    const delta = rawEndDate.getTime() - rawStartDate.getTime()
    const newEnd = new Date(last)
    newEnd.setHours(23, 59, 59, 999)
    const newStart = new Date(newEnd.getTime() - delta)
    newStart.setHours(0, 0, 0, 0)
    return { startDate: newStart, endDate: newEnd }
  }, [rawStartDate, rawEndDate, metaLastDate])

  const { startDate: prevStartDate, endDate: prevEndDate } = useMemo(() => getPreviousPeriodDates(startDate, endDate), [startDate, endDate])

  const buildQueryParams = (start: Date, end: Date) => {
    const params = new URLSearchParams({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })
    if (selectedStores && selectedStores.length) {
      params.append('storeIds', selectedStores.join(','))
    }
    if (selectedChannel) {
      params.append('channelIds', selectedChannel.toString())
    }
    return params.toString()
  }

  const currentParams = buildQueryParams(startDate, endDate)
  const previousParams = buildQueryParams(prevStartDate, prevEndDate)
  
  const { data: currentKpis } = useSWR<KpisResponse>(`/api/kpis?${currentParams}`, fetcher)
  const { data: previousKpis } = useSWR<KpisResponse>(`/api/kpis?${previousParams}`, fetcher)

  const { data: filtersData } = useSWR<FiltersResponse>(`/api/filters?${currentParams}`, fetcher)

  const { data: revenueByDay } = useSWR<ChartResponse>(
    `/api/sales-timeseries?${currentParams}&timeBucket=day`, fetcher
  )
  
  const { data: revenueByChannel } = useSWR<ChartResponse>(
    `/api/distribution/channel?${currentParams}`, fetcher
  )

  const { data: prevRevenueByChannel } = useSWR<ChartResponse>(
    `/api/distribution/channel?${previousParams}`, fetcher
  )
  
  const { data: revenueByStore } = useSWR<ChartResponse>(
    `/api/query?${currentParams}&metric=revenue&dimension=store`, fetcher
  )

  const { data: prevRevenueByStore } = useSWR<ChartResponse>(
    `/api/query?${previousParams}&metric=revenue&dimension=store`, fetcher
  )

  const { data: topProducts } = useSWR<TopProductsResponse>(
    `/api/ranking/products?${currentParams}&orderBy=revenue_generated`, fetcher
  )

  const mappedTopProducts = useMemo(() => {
    if (!topProducts) return []
    return topProducts.map((p: any) => ({
      product_name: p.product_name || p.name || '—',
      product_id: p.product_id ?? p.id ?? 0,
      total_quantity: Number(p.units_sold ?? p.total_quantity ?? 0),
      total_revenue: Number(p.revenue_generated ?? p.total_revenue ?? 0),
      order_count: Number(p.units_sold ?? p.order_count ?? 0),
    })) as TopProductsResponse
  }, [topProducts])

  const { data: revenueByHour } = useSWR<ChartResponse>(
    analysisFocus === 'temporal' ? `/api/query?${currentParams}&metric=revenue&dimension=hour` : null,
    fetcher
  )

  const { data: revenueByWeekday } = useSWR<ChartResponse>(
    analysisFocus === 'temporal' ? `/api/query?${currentParams}&metric=revenue&dimension=weekday` : null,
    fetcher
  )

  const customQueryUrl = useMemo(() => {
    if (!customQuery) return null 
    
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metric: customQuery.metric,
      dimension: customQuery.dimension,
    })
    if (selectedStores && selectedStores.length) params.append('storeIds', selectedStores.join(','))
    if (selectedChannel) params.append('channelIds', selectedChannel.toString())
    
    return `/api/query?${params.toString()}`
  }, [customQuery, startDate, endDate, selectedStores, selectedChannel])

  const { 
    data: customData, 
    error: customError,
    isLoading: isCustomQueryLoading 
  } = useSWR<ChartResponse>(customQueryUrl, fetcher)


  const metrics = useMemo(() => {
    if (!currentKpis || !previousKpis) {
      return {
        revenue: { value: 0, change: 0, trend: 'neutral' as const },
        ticket: { value: 0, change: 0, trend: 'neutral' as const },
        orders: { value: 0, change: 0, trend: 'neutral' as const },
      }
    }

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }
    const getTrend = (change: number) => (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral' as const)

    const revenueChange = calculateChange(currentKpis.total_revenue, previousKpis.total_revenue)
    const ticketChange = calculateChange(currentKpis.avg_ticket, previousKpis.avg_ticket)
    const ordersChange = calculateChange(currentKpis.total_sales, previousKpis.total_sales)

    return {
      revenue: {
        value: currentKpis.total_revenue,
        change: Math.abs(revenueChange),
        trend: getTrend(revenueChange),
      },
      ticket: {
        value: currentKpis.avg_ticket,
        change: Math.abs(ticketChange),
        trend: getTrend(ticketChange),
      },
      orders: {
        value: currentKpis.total_sales,
        change: Math.abs(ordersChange),
        trend: getTrend(ordersChange),
      },
    }
  }, [currentKpis, previousKpis])

  const insights = useMemo(() => {

    const formatChartData = (data: ChartResponse | undefined): ChartDataPoint[] =>
      data?.map(d => ({ date: d.name, value: d.value, label: d.name })) || []
      
    return generateInsights(
      currentKpis,
      previousKpis,
      formatChartData(revenueByChannel),
      formatChartData(prevRevenueByChannel),
      formatChartData(revenueByStore),
      formatChartData(prevRevenueByStore)
    )
  }, [currentKpis, previousKpis, revenueByChannel, prevRevenueByChannel, revenueByStore, prevRevenueByStore])

  const formatDataForChart = (data: ChartResponse | undefined, isTimeSeries: boolean = false): ChartDataPoint[] => {
    if (!data) return []

    const normalized = data.map((item: any) => {
      const rawName = item.name ?? item.time_bucket ?? item.channel_name ?? item.product_name ?? item.label ?? item[0]
      const rawValue = item.value ?? item.total_revenue ?? item.revenue_generated ?? item.total_sales ?? item.units_sold ?? item.count ?? 0

      const parsedTime = Date.parse(String(rawName))
      const hasValidDate = !Number.isNaN(parsedTime)

      const date = String(rawName)
      const displayDate = hasValidDate ? new Date(parsedTime).toLocaleDateString('pt-BR') : String(rawName)

      return {
        date,
        value: Number(rawValue) || 0,
        label: item.label || displayDate || String(rawName),
        _ts: hasValidDate ? parsedTime : undefined,
      } as ChartDataPoint & { _ts?: number }
    })

    normalized.sort((a: any, b: any) => {
      if (isTimeSeries) {
        const ta = a._ts ?? Date.parse(a.date)
        const tb = b._ts ?? Date.parse(b.date)
        return (ta || 0) - (tb || 0)
      }
      return b.value - a.value
    })

    return normalized.map(({ _ts, ...rest }: any) => rest as ChartDataPoint)
  }

  const charts = {
    revenueByDay: formatDataForChart(revenueByDay, true),
    revenueByChannel: formatDataForChart(revenueByChannel),
    revenueByStore: formatDataForChart(revenueByStore),
    topProducts: mappedTopProducts || [],
    revenueByHour: formatDataForChart(revenueByHour),
    revenueByWeekday: formatDataForChart(revenueByWeekday),
  }

  const focusContent = useMemo(() => {

    const formatTopProductsForChart = (data: TopProductsResponse | undefined): ChartDataPoint[] => {
      if (!data) return []
      return data.slice(0, 10).map(p => ({
        date: p.product_name,
        value: Number(p.total_revenue) || 0,
        label: p.product_name,
      }))
    }

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
          description: selectedStores && selectedStores.length === 1
            ? `Dados específicos da loja selecionada`
            : selectedStores && selectedStores.length > 1
            ? `Dados das lojas selecionadas`
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
                  key="products-revenue"
                  data={formatTopProductsForChart(mappedTopProducts)}
                  title="Faturamento por Produto (Top 10)"
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
                  data={charts.revenueByHour}
                  title="Faturamento por Hora do Dia"
                />
              ),
            },
            {
              component: (
                <ComparisonChart
                  key="by-weekday"
                  data={charts.revenueByWeekday}
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
        return { title: "Visão Geral", description: "Panorama do negócio", charts: [] }
    }
  }, [analysisFocus, selectedStores, charts, topProducts])

  const handleQueryChange = (
    metric: MetricType, 
    dimension: DimensionType, 
    chartType: ChartType
  ) => {
    setCustomQuery({ metric, dimension, chartType })
    setIsQueryBuilderVisible(true)
  }
  return (
    <div className="flex min-h-screen bg-background">
      <AnalysisFocusSidebar selectedFocus={analysisFocus} onFocusChange={setAnalysisFocus} />

      <div className="flex-1 flex flex-col">
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
          storeId={selectedStores}
          onStoreChange={setSelectedStores}
          channelId={selectedChannel}
          onChannelChange={setSelectedChannel}
          productId={selectedProduct}
          onProductChange={setSelectedProduct}
          filtersData={filtersData}
        />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-6 space-y-6">
            {/* Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Faturamento Total"
                value={formatCurrency(metrics.revenue.value)}
                change={metrics.revenue.change}
                trend={metrics.revenue.trend as "neutral" | "up" | "down" | undefined }
                subtitle="vs período anterior"
              />
              <MetricCard
                title="Ticket Médio"
                value={formatCurrency(metrics.ticket.value)}
                change={metrics.ticket.change}
                trend={metrics.ticket.trend as "neutral" | "up" | "down" | undefined }
                subtitle="por pedido"
              />
              <MetricCard
                title="Total de Pedidos"
                value={formatNumber(metrics.orders.value)}
                change={metrics.orders.change}
                trend={metrics.orders.trend as "neutral" | "up" | "down" | undefined }
                subtitle="pedidos concluídos"
              />
            </div>

            <AutomaticInsightsSection insights={insights} />

          
          <QueryBuilder onQueryChange={handleQueryChange} />

          {isQueryBuilderVisible && (
            <div>
              {isCustomQueryLoading && <p className="text-muted-foreground">Gerando visualização...</p>}
              {customError && <p className="text-destructive">Erro: {customError.message}</p>}
              {customData && customQuery && (
                <DynamicChart
                  metric={customQuery.metric}
                  dimension={customQuery.dimension}
                  chartType={customQuery.chartType}
                  data={customData}
                  title={`Análise Customizada: ${metricLabels[customQuery.metric]} por ${dimensionLabels[customQuery.dimension]}`}
                  description="Visualização gerada dinamicamente com base na sua seleção."
                />
              )}
            </div>
          )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Análise Focada: {focusContent.title}
              </h2>
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