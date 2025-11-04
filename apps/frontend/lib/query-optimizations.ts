import { startOfDay, endOfDay, differenceInDays } from 'date-fns'

interface TimeseriesOptions {
  startDate: string | Date
  endDate: string | Date
  timeBucket?: 'hour' | 'day' | 'week' | 'month'
}

export function getOptimalTimeBucket({ startDate, endDate, timeBucket }: TimeseriesOptions): string {
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  const daysDiff = differenceInDays(endOfDay(end), startOfDay(start))
  
  // Se já foi especificado um timeBucket, validar se é adequado para o período
  if (timeBucket) {
    // Se o período for muito longo, sobrescrever para evitar sobrecarga
    if (timeBucket === 'hour' && daysDiff > 2) return 'day'
    if (timeBucket === 'day' && daysDiff > 45) return 'week'
    if (timeBucket === 'week' && daysDiff > 120) return 'month'
    return timeBucket
  }

  // Otimização automática mais agressiva baseada no período
  if (daysDiff <= 2) return 'hour'      // Até 2 dias -> por hora
  if (daysDiff <= 14) return 'day'      // Até 2 semanas -> diário
  if (daysDiff <= 90) return 'week'     // Até 3 meses -> semanal
  if (daysDiff <= 150) return 'week'    // Até 5 meses -> semanal
  return 'month'                        // Mais que 5 meses -> mensal
}

export function shouldUseMaterializedView(startDate: string | Date, endDate: string | Date): boolean {
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  const daysDiff = differenceInDays(endOfDay(end), startOfDay(start))
  return daysDiff > 90 // Usar views materializadas para períodos > 90 dias
}

export function getChunkSize(startDate: string | Date, endDate: string | Date): number {
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  const daysDiff = differenceInDays(endOfDay(end), startOfDay(start))
  if (daysDiff <= 31) return 1000
  if (daysDiff <= 90) return 500
  return 250 // Menor chunk size para períodos muito longos
}

export function getCacheTTL(startDate: string | Date, endDate: string | Date): number {
  const daysDiff = differenceInDays(endOfDay(endDate), startOfDay(startDate))
  // Cache em segundos
  if (daysDiff <= 1) return 300 // 5 minutos para hoje/ontem
  if (daysDiff <= 7) return 1800 // 30 minutos para última semana
  if (daysDiff <= 30) return 3600 // 1 hora para último mês
  if (daysDiff <= 90) return 7200 // 2 horas para último trimestre
  return 14400 // 4 horas para semestre
}