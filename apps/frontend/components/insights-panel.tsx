import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react"
import type { Insight } from "@/lib/insights"
import { cn } from "@/lib/utils"

interface InsightsPanelProps {
  insights: Insight[]
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Insights Automáticos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum insight significativo detectado neste período.</p>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg border",
                insight.type === "positive" && "bg-green-500/5 border-green-500/20",
                insight.type === "negative" && "bg-red-500/5 border-red-500/20",
                insight.type === "warning" && "bg-yellow-500/5 border-yellow-500/20",
                insight.type === "neutral" && "bg-blue-500/5 border-blue-500/20",
              )}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
