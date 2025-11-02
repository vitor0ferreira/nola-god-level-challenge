"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Package, Store, Clock, Users, DollarSign } from "lucide-react"

interface QuickReportsProps {
  onReportSelect: (reportId: string) => void
}

const reports = [
  {
    id: "top-products-delivery",
    title: "Top 10 Produtos no Delivery",
    description: "Produtos mais vendidos nos canais de delivery",
    icon: Package,
    color: "text-blue-500",
  },
  {
    id: "store-comparison",
    title: "Comparação de Lojas",
    description: "Performance de faturamento entre lojas",
    icon: Store,
    color: "text-orange-500",
  },
  {
    id: "peak-hours",
    title: "Horários de Pico",
    description: "Vendas por hora do dia",
    icon: Clock,
    color: "text-green-500",
  },
  {
    id: "channel-performance",
    title: "Performance por Canal",
    description: "Faturamento e ticket médio por canal",
    icon: TrendingUp,
    color: "text-purple-500",
  },
  {
    id: "customer-frequency",
    title: "Frequência de Clientes",
    description: "Distribuição de clientes por número de compras",
    icon: Users,
    color: "text-pink-500",
  },
  {
    id: "discount-analysis",
    title: "Análise de Descontos",
    description: "Impacto dos descontos no faturamento",
    icon: DollarSign,
    color: "text-yellow-500",
  },
]

export function QuickReports({ onReportSelect }: QuickReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Rápidos</CardTitle>
        <CardDescription>Acesse análises prontas com um clique</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Button
              key={report.id}
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 text-left bg-transparent"
              onClick={() => onReportSelect(report.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <report.icon className={`h-5 w-5 ${report.color}`} />
                <span className="font-semibold text-sm">{report.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{report.description}</p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
