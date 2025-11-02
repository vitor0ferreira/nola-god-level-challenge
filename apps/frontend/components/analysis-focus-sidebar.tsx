"use client"

import { cn } from "@/lib/utils"
import { BarChart3, Store, Package, Radio, Clock, Users, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export type AnalysisFocus = "geral" | "lojas" | "produtos" | "canais" | "temporal" | "clientes"

interface AnalysisFocusSidebarProps {
  selectedFocus: AnalysisFocus
  onFocusChange: (focus: AnalysisFocus) => void
}

const focusOptions = [
  {
    id: "geral" as const,
    label: "Visão Geral",
    description: "Overview completo do negócio",
    icon: LayoutGrid,
  },
  {
    id: "lojas" as const,
    label: "Lojas",
    description: "Análise por loja",
    icon: Store,
  },
  {
    id: "produtos" as const,
    label: "Produtos",
    description: "Performance de produtos",
    icon: Package,
  },
  {
    id: "canais" as const,
    label: "Canais de Venda",
    description: "Delivery, presencial, etc",
    icon: Radio,
  },
  {
    id: "temporal" as const,
    label: "Análise Temporal",
    description: "Tendências ao longo do tempo",
    icon: Clock,
  },
  {
    id: "clientes" as const,
    label: "Clientes",
    description: "Comportamento de clientes",
    icon: Users,
  },
]

export function AnalysisFocusSidebar({ selectedFocus, onFocusChange }: AnalysisFocusSidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Foco de Análise</h2>
        </div>
        <p className="text-xs text-muted-foreground">Selecione o tipo de análise</p>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2 space-y-1">
          {focusOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedFocus === option.id

            return (
              <Button
                key={option.id}
                variant={isSelected ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-3",
                  isSelected && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                )}
                onClick={() => onFocusChange(option.id)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">{option.description}</span>
                </div>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
