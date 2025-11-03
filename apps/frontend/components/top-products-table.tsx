import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TopProduct } from "@/lib/database"
import { formatCurrency, formatNumber } from "@/lib/calculations"

interface TopProductsTableProps {
  products: TopProduct[]
  title: string
}

export function TopProductsTable({ products, title }: TopProductsTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.product_name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{product.product_name}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(product.order_count)} pedidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatCurrency(product.total_revenue)}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(product.total_quantity)} unidades</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
