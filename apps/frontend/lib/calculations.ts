export function getPeriodDates(period: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999) 

  const startDate = new Date(now)

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0)
      break
    case "yesterday":
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
      break
    case "week":
      startDate.setDate(startDate.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
      break
    case "month":
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
      break
    case "quarter":
      startDate.setDate(startDate.getDate() - 90)
      startDate.setHours(0, 0, 0, 0)
      break
    case "semester":
      startDate.setDate(startDate.getDate() - 180)
      startDate.setHours(0, 0, 0, 0)
      break
    default:
      startDate.setDate(startDate.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
  }

  return { startDate, endDate }
}

export function getPreviousPeriodDates(startDate: Date, endDate: Date): { startDate: Date; endDate: Date } {
  const periodLength = endDate.getTime() - startDate.getTime()

  const prevEndDate = new Date(startDate.getTime() - 1) 
  const prevStartDate = new Date(prevEndDate.getTime() - periodLength)

  prevStartDate.setHours(0, 0, 0, 0); 
  
  return { startDate: prevStartDate, endDate: prevEndDate }
}

export function formatCurrency(value: number): string {
  if (value === null || value === undefined) return "R$ 0,00"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value === null || value === undefined) return "0"
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function formatPercentage(value: number): string {
  if (value === null || value === undefined) return "0,0%"
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}