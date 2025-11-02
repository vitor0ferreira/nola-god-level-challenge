export interface Brand {
  id: number
  name: string
  created_at: Date
}

export interface SubBrand {
  id: number
  brand_id: number
  name: string
  created_at: Date
}

export interface Store {
  id: number
  brand_id: number
  sub_brand_id: number | null
  name: string
  city: string | null
  state: string | null
  district: string | null
  is_active: boolean
  is_own: boolean
  created_at: Date
}

export interface Channel {
  id: number
  brand_id: number
  name: string
  description: string | null
  type: "P" | "D" // P=Presencial, D=Delivery
  created_at: Date
}

export interface Product {
  id: number
  brand_id: number
  sub_brand_id: number | null
  category_id: number | null
  name: string
  deleted_at: Date | null
}

export interface Category {
  id: number
  brand_id: number
  sub_brand_id: number | null
  name: string
  type: "P" | "I" // P=Produto, I=Item
  deleted_at: Date | null
}

export interface Sale {
  id: number
  store_id: number
  sub_brand_id: number | null
  customer_id: number | null
  channel_id: number
  cod_sale1: string | null
  created_at: Date
  customer_name: string | null
  sale_status_desc: string
  total_amount_items: number
  total_discount: number
  total_increase: number
  delivery_fee: number
  service_tax_fee: number
  total_amount: number
  value_paid: number
  production_seconds: number | null
  delivery_seconds: number | null
  people_quantity: number | null
  origin: string
}

export interface ProductSale {
  id: number
  sale_id: number
  product_id: number
  quantity: number
  base_price: number
  total_price: number
}

// Aggregated metrics for dashboard
export interface MetricData {
  label: string
  value: number
  change?: number // percentage change vs previous period
  trend?: "up" | "down" | "neutral"
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TopProduct {
  product_id: number
  product_name: string
  total_quantity: number
  total_revenue: number
  order_count: number
}
