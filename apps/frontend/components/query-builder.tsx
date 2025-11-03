"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BarChart3, LineChart, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"

export type MetricType = "revenue" | "orders" | "ticket" | "discount" | "production_time" | "delivery_time" | "quantity"

export type DimensionType =
  | "day"
  | "month"
  | "store"
  | "channel"
  | "product"
  | "category"
  | "hour"
  | "weekday"
  | "payment_type"

export type ChartType = "bar" | "line" | "pie"

interface QueryBuilderProps {
  onQueryChange: (metric: MetricType, dimension: DimensionType, chartType: ChartType) => void
}

import {
  metricLabels,
  metricDescriptions,
  dimensionLabels,
  dimensionDescriptions,
  chartTypes as defaultChartTypes
} from "@/lib/constants"

const metrics = Object.entries(metricLabels).map(([value, label]) => ({
  value,
  label,
  description: metricDescriptions[value]
}))

const dimensions = Object.entries(dimensionLabels).map(([value, label]) => ({
  value,
  label,
  description: dimensionDescriptions[value]
}))

const chartTypes = [
  { value: "bar", label: "Barras", icon: BarChart3 },
  { value: "line", label: "Linha", icon: LineChart },
  { value: "pie", label: "Pizza", icon: PieChart },
]

export function QueryBuilder({ onQueryChange }: QueryBuilderProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue")
  const [selectedDimension, setSelectedDimension] = useState<DimensionType>("day")
  const [selectedChartType, setSelectedChartType] = useState<ChartType>("bar")

  const handleApply = () => {
    onQueryChange(selectedMetric, selectedDimension, selectedChartType)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Construtor de Visualizações
        </CardTitle>
        <CardDescription>Crie visualizações personalizadas selecionando uma métrica e uma dimensão</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Metric selector */}
          <div className="space-y-2">
            <Label htmlFor="metric">O que medir?</Label>
            <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
              <SelectTrigger id="metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{metric.label}</span>
                      <span className="text-xs text-muted-foreground">{metric.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dimension selector */}
          <div className="space-y-2">
            <Label htmlFor="dimension">Como agrupar?</Label>
            <Select value={selectedDimension} onValueChange={(v) => setSelectedDimension(v as DimensionType)}>
              <SelectTrigger id="dimension">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dimension) => (
                  <SelectItem key={dimension.value} value={dimension.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{dimension.label}</span>
                      <span className="text-xs text-muted-foreground">{dimension.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart type selector */}
          <div className="space-y-2">
            <Label htmlFor="chart-type">Tipo de gráfico</Label>
            <Select value={selectedChartType} onValueChange={(v) => setSelectedChartType(v as ChartType)}>
              <SelectTrigger id="chart-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((chart) => (
                  <SelectItem key={chart.value} value={chart.value}>
                    <div className="flex items-center gap-2">
                      <chart.icon className="h-4 w-4" />
                      <span>{chart.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleApply} className="w-full">
          Gerar Visualização
        </Button>
      </CardContent>
    </Card>
  )
}
