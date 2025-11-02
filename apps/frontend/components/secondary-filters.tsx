"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { mockStores, mockChannels, mockProducts } from "@/lib/mock-data"
import type { AnalysisFocus } from "./analysis-focus-sidebar"

interface SecondaryFiltersProps {
  focus: AnalysisFocus
  period: string
  onPeriodChange: (period: string) => void
  storeId: number | null
  onStoreChange: (storeId: number | null) => void
  channelId: number | null
  onChannelChange: (channelId: number | null) => void
  productId: number | null
  onProductChange: (productId: number | null) => void
}

export function SecondaryFilters({
  focus,
  period,
  onPeriodChange,
  storeId,
  onStoreChange,
  channelId,
  onChannelChange,
  productId,
  onProductChange,
}: SecondaryFiltersProps) {
  const periodOptions = [
    { value: "today", label: "Hoje" },
    { value: "yesterday", label: "Ontem" },
    { value: "week", label: "Últimos 7 dias" },
    { value: "month", label: "Últimos 30 dias" },
    { value: "quarter", label: "Últimos 90 dias" },
  ]

  const showStoreFilter = focus === "lojas" || focus === "produtos" || focus === "canais"
  const showChannelFilter = focus === "canais" || focus === "produtos"
  const showProductFilter = focus === "produtos"

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-card border-b border-border">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="period" className="text-xs text-muted-foreground mb-1.5 block">
          Período
        </Label>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger id="period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showStoreFilter && (
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="store" className="text-xs text-muted-foreground mb-1.5 block">
            Loja
          </Label>
          <Select
            value={storeId?.toString() || "all"}
            onValueChange={(v) => onStoreChange(v === "all" ? null : Number(v))}
          >
            <SelectTrigger id="store">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as lojas</SelectItem>
              {mockStores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showChannelFilter && (
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="channel" className="text-xs text-muted-foreground mb-1.5 block">
            Canal
          </Label>
          <Select
            value={channelId?.toString() || "all"}
            onValueChange={(v) => onChannelChange(v === "all" ? null : Number(v))}
          >
            <SelectTrigger id="channel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              {mockChannels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id.toString()}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showProductFilter && (
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="product" className="text-xs text-muted-foreground mb-1.5 block">
            Produto
          </Label>
          <Select
            value={productId?.toString() || "all"}
            onValueChange={(v) => onProductChange(v === "all" ? null : Number(v))}
          >
            <SelectTrigger id="product">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {mockProducts.slice(0, 20).map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
