"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MultiStoreSelect } from './multi-store-select'
import type { AnalysisFocus } from "./analysis-focus-sidebar"

interface SecondaryFiltersProps {
  focus: AnalysisFocus
  period: string
  onPeriodChange: (period: string) => void
  storeId: number[]
  onStoreChange: (storeId: number[]) => void
  channelId: number | null
  onChannelChange: (channelId: number | null) => void
  productId: number | null
  onProductChange: (productId: number | null) => void
  filtersData?: {
    stores?: Array<{id: number, name: string}>
    channels?: Array<{id: number, name: string}>
    products?: Array<{id: number, name: string}>
  }
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
  filtersData
}: SecondaryFiltersProps) {
  const periodOptions = [
    { value: "today", label: "Hoje" },
    { value: "yesterday", label: "Ontem" },
    { value: "week", label: "Últimos 7 dias" },
    { value: "month", label: "Últimos 30 dias" },
    { value: "quarter", label: "Últimos 90 dias" },
    { value: "semester", label: "Últimos 180 dias" },
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
          <MultiStoreSelect
            stores={filtersData?.stores ?? []}
            value={storeId ?? []}
            onChange={(ids) => onStoreChange(ids)}
          />
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
              {filtersData?.channels?.map((channel:{id: number, name: string}) => (
                <SelectItem key={channel.id} value={channel.id.toString()}>
                  {channel.name}
                </SelectItem>
              )) ?? null}
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
              {filtersData?.products?.map((product:{id: number, name: string}) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              )) ?? null}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
