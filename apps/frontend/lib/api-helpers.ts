import { z } from 'zod'

export const BaseQuerySchema = z.object({
  startDate: z.string().datetime({ message: "Formato de startDate inválido. Use ISO 8601." }),
  endDate: z.string().datetime({ message: "Formato de endDate inválido. Use ISO 8601." }),
  storeIds: z.string().optional().nullable(),
  channelIds: z.string().optional().nullable(),
});

function parseNumberArray(str: string | null | undefined): number[] | null {
  if (!str) return null
  const arr = str.split(',').map(Number).filter(Boolean)
  return arr.length > 0 ? arr : null
}

export function validateQueryParams(searchParams: URLSearchParams) {
  const params = {
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    storeIds: searchParams.get('storeIds'),
    channelIds: searchParams.get('channelIds'),
  }

  const validation = BaseQuerySchema.safeParse(params)
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '))
  }
  
  const { startDate, endDate, storeIds, channelIds } = validation.data

  const storeIdArray = parseNumberArray(storeIds)
  const channelIdArray = parseNumberArray(channelIds)

  return { startDate, endDate, storeIdArray, channelIdArray }
}

export function serializePrismaData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {

    if (typeof value === 'bigint') {
      return Number(value) 
    }

    if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
      return Number(value)
    }
    
    return value
  }))
}