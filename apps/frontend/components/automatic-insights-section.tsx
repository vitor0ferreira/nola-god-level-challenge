"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react"
import type { Insight } from "@/lib/insights"

interface AutomaticInsightsSectionProps {
  insights: Insight[]
}

export function AutomaticInsightsSection({ insights }: AutomaticInsightsSectionProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análises Automáticas</CardTitle>
          <CardDescription>Nenhum insight relevante detectado no momento</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análises Automáticas</CardTitle>
        <CardDescription>Insights detectados automaticamente nos seus dados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon =
              insight.type === "positive"
                ? TrendingUp
                : insight.type === "negative"
                  ? TrendingDown
                  : insight.type === "warning"
                    ? AlertCircle
                    : Info

            const badgeVariant =
              insight.type === "positive"
                ? "default"
                : insight.type === "negative"
                  ? "destructive"
                  : insight.type === "warning"
                    ? "secondary"
                    : "outline"

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <Icon
                  className={`h-5 w-5 mt-0.5 shrink-0 ${
                    insight.type === "positive"
                      ? "text-green-500"
                      : insight.type === "negative"
                        ? "text-red-500"
                        : insight.type === "warning"
                          ? "text-yellow-500"
                          : "text-blue-500"
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant} className="text-xs">
                      {insight?.value}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
