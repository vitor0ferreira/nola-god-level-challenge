"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ChartDataPoint } from "@/lib/database"
import { formatCurrency } from "@/lib/calculations"

interface ComparisonChartProps {
  data: ChartDataPoint[]
  title: string
}

export function ComparisonChart({ data, title }: ComparisonChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="label" stroke="rgb(163, 163, 163)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="rgb(163, 163, 163)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(20, 20, 20)",
                border: "1px solid rgb(38, 38, 38)",
                borderRadius: "8px",
                color: "rgb(250, 250, 250)",
              }}
              formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
            />
            <Bar dataKey="value" fill="rgb(251, 146, 60)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
