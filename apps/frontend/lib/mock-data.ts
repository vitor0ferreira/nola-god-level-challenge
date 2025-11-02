import type { Sale, Store, Channel, Product, Category, Brand, SubBrand } from "@/lib/database"

export const mockBrands: Brand[] = [{ id: 1, name: "Restaurante Maria", created_at: new Date("2020-01-01") }]

export const mockSubBrands: SubBrand[] = [
  { id: 1, brand_id: 1, name: "Maria Express", created_at: new Date("2021-01-01") },
  { id: 2, brand_id: 1, name: "Maria Premium", created_at: new Date("2021-06-01") },
]

export const mockStores: Store[] = [
  {
    id: 1,
    brand_id: 1,
    sub_brand_id: 1,
    name: "Loja Centro",
    city: "São Paulo",
    state: "SP",
    district: "Centro",
    is_active: true,
    is_own: true,
    created_at: new Date("2020-01-01"),
  },
  {
    id: 2,
    brand_id: 1,
    sub_brand_id: 1,
    name: "Loja Jardins",
    city: "São Paulo",
    state: "SP",
    district: "Jardins",
    is_active: true,
    is_own: true,
    created_at: new Date("2020-06-01"),
  },
  {
    id: 3,
    brand_id: 1,
    sub_brand_id: 2,
    name: "Loja Vila Mariana",
    city: "São Paulo",
    state: "SP",
    district: "Vila Mariana",
    is_active: true,
    is_own: false,
    created_at: new Date("2021-01-01"),
  },
]

// Mock channels
export const mockChannels: Channel[] = [
  {
    id: 1,
    brand_id: 1,
    name: "Presencial",
    description: "Vendas no balcão",
    type: "P",
    created_at: new Date("2020-01-01"),
  },
  {
    id: 2,
    brand_id: 1,
    name: "iFood",
    description: "Delivery via iFood",
    type: "D",
    created_at: new Date("2020-01-01"),
  },
  {
    id: 3,
    brand_id: 1,
    name: "Rappi",
    description: "Delivery via Rappi",
    type: "D",
    created_at: new Date("2020-03-01"),
  },
  {
    id: 4,
    brand_id: 1,
    name: "Uber Eats",
    description: "Delivery via Uber Eats",
    type: "D",
    created_at: new Date("2020-06-01"),
  },
]

// Mock categories
export const mockCategories: Category[] = [
  { id: 1, brand_id: 1, sub_brand_id: null, name: "Hambúrgueres", type: "P", deleted_at: null },
  { id: 2, brand_id: 1, sub_brand_id: null, name: "Pizzas", type: "P", deleted_at: null },
  { id: 3, brand_id: 1, sub_brand_id: null, name: "Bebidas", type: "P", deleted_at: null },
  { id: 4, brand_id: 1, sub_brand_id: null, name: "Sobremesas", type: "P", deleted_at: null },
  { id: 5, brand_id: 1, sub_brand_id: null, name: "Saladas", type: "P", deleted_at: null },
]

// Mock products
export const mockProducts: Product[] = [
  { id: 1, brand_id: 1, sub_brand_id: null, category_id: 1, name: "X-Burger Clássico", deleted_at: null },
  { id: 2, brand_id: 1, sub_brand_id: null, category_id: 1, name: "X-Bacon", deleted_at: null },
  { id: 3, brand_id: 1, sub_brand_id: null, category_id: 1, name: "X-Tudo", deleted_at: null },
  { id: 4, brand_id: 1, sub_brand_id: null, category_id: 2, name: "Pizza Margherita", deleted_at: null },
  { id: 5, brand_id: 1, sub_brand_id: null, category_id: 2, name: "Pizza Calabresa", deleted_at: null },
  { id: 6, brand_id: 1, sub_brand_id: null, category_id: 2, name: "Pizza Portuguesa", deleted_at: null },
  { id: 7, brand_id: 1, sub_brand_id: null, category_id: 3, name: "Coca-Cola 350ml", deleted_at: null },
  { id: 8, brand_id: 1, sub_brand_id: null, category_id: 3, name: "Suco Natural", deleted_at: null },
  { id: 9, brand_id: 1, sub_brand_id: null, category_id: 4, name: "Brownie", deleted_at: null },
  { id: 10, brand_id: 1, sub_brand_id: null, category_id: 4, name: "Pudim", deleted_at: null },
  { id: 11, brand_id: 1, sub_brand_id: null, category_id: 5, name: "Salada Caesar", deleted_at: null },
  { id: 12, brand_id: 1, sub_brand_id: null, category_id: 1, name: "Smash Burger", deleted_at: null },
]

// Generate realistic sales data for the last 60 days
export function generateMockSales(): Sale[] {
  const sales: Sale[] = []
  const now = new Date()
  const statuses = ["Concluído", "Cancelado", "Em preparo"]

  // Generate 2000+ sales over 60 days
  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)

    // More sales on weekends and dinner time
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const dailySales = isWeekend ? 40 + Math.floor(Math.random() * 20) : 25 + Math.floor(Math.random() * 15)

    for (let i = 0; i < dailySales; i++) {
      const hour = Math.floor(Math.random() * 14) + 10 // 10am to 11pm
      const saleDate = new Date(date)
      saleDate.setHours(hour, Math.floor(Math.random() * 60))

      const storeId = mockStores[Math.floor(Math.random() * mockStores.length)].id
      const channelId = mockChannels[Math.floor(Math.random() * mockChannels.length)].id
      const channel = mockChannels.find((c) => c.id === channelId)!

      const itemsAmount = 20 + Math.random() * 80
      const discount = Math.random() > 0.7 ? Math.random() * 10 : 0
      const deliveryFee = channel.type === "D" ? 5 + Math.random() * 10 : 0
      const serviceTax = itemsAmount * 0.1
      const totalAmount = itemsAmount - discount + deliveryFee + serviceTax

      const status = Math.random() > 0.95 ? "Cancelado" : "Concluído"

      sales.push({
        id: sales.length + 1,
        store_id: storeId,
        sub_brand_id: mockStores.find((s) => s.id === storeId)?.sub_brand_id || null,
        customer_id: Math.floor(Math.random() * 500) + 1,
        channel_id: channelId,
        cod_sale1: `ORD-${sales.length + 1}`,
        created_at: saleDate,
        customer_name: `Cliente ${Math.floor(Math.random() * 500)}`,
        sale_status_desc: status,
        total_amount_items: itemsAmount,
        total_discount: discount,
        total_increase: 0,
        delivery_fee: deliveryFee,
        service_tax_fee: serviceTax,
        total_amount: totalAmount,
        value_paid: status === "Concluído" ? totalAmount : 0,
        production_seconds: 600 + Math.floor(Math.random() * 1200),
        delivery_seconds: channel.type === "D" ? 1200 + Math.floor(Math.random() * 1800) : null,
        people_quantity: Math.floor(Math.random() * 4) + 1,
        origin: "POS",
      })
    }
  }

  return sales
}

export const mockSales = generateMockSales()

// Generate product sales
export function generateMockProductSales(): Map<number, number[]> {
  const productSalesMap = new Map<number, number[]>()

  mockSales.forEach((sale) => {
    const numProducts = Math.floor(Math.random() * 3) + 1
    const selectedProducts: number[] = []

    for (let i = 0; i < numProducts; i++) {
      const productId = mockProducts[Math.floor(Math.random() * mockProducts.length)].id
      selectedProducts.push(productId)
    }

    productSalesMap.set(sale.id, selectedProducts)
  })

  return productSalesMap
}

export const mockProductSalesMap = generateMockProductSales()
