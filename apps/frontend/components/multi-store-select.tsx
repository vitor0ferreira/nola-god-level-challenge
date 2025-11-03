"use client"

import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface MultiStoreSelectProps {
  stores: Array<{ id: number; name: string }>
  value: number[]
  onChange: (ids: number[]) => void
}

export function MultiStoreSelect({ stores, value, onChange }: MultiStoreSelectProps) {
  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id))
    else onChange([...value, id])
  }

  const label = value.length === 0 ? 'Todas as lojas' : value.length === 1 ? `1 loja selecionada` : `${value.length} lojas selecionadas`

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" className="w-full text-left">{label}</Button>
      </Popover.Trigger>
      <Popover.Content className="z-50 w-72 p-2 bg-popover border rounded-md shadow-md">
        <div className="space-y-2">
          <Label className="text-xs">Selecione lojas</Label>
          <div className="max-h-48 overflow-auto">
            <div className="p-1">
              <div className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  checked={value.length === stores.length}
                  onChange={(e) => onChange(e.target.checked ? stores.map(s => s.id) : [])}
                />
                <span className="text-sm">Todas as lojas</span>
              </div>
              {stores.map((s) => (
                <label key={s.id} className="flex items-center gap-2 p-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.includes(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <Popover.Arrow className="fill-popover" />
      </Popover.Content>
    </Popover.Root>
  )
}
