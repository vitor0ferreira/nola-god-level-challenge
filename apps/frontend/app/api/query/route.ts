import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { BaseQuerySchema, serializePrismaData } from '@/lib/api-helpers'
import { z } from 'zod'
import { 
  buildDynamicQuery, 
  MetricType, 
  DimensionType 
} from '@/lib/query-builder-helpers'


const QueryBuilderSchema = BaseQuerySchema.extend({
  metric: z.enum([
    "revenue", "orders", "ticket", "discount", 
    "production_time", "delivery_time", "quantity"
  ]),
  dimension: z.enum([
    "day", "month", "store", "channel", "product", 
    "category", "hour", "weekday", "payment_type"
  ]),
});

function parseNumberArray(str: string | null | undefined): number[] | null {
  if (!str) return null
  const arr = str.split(',').map(Number).filter(Boolean)
  return arr.length > 0 ? arr : null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      storeIds: searchParams.get('storeIds'),
      channelIds: searchParams.get('channelIds'),
      metric: searchParams.get('metric'),
      dimension: searchParams.get('dimension'),
    }

    const validation = QueryBuilderSchema.safeParse(params)
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '))
    }

    const { 
      startDate, 
      endDate, 
      storeIds, 
      channelIds, 
      metric, 
      dimension 
    } = validation.data
    
    const storeIdArray = parseNumberArray(storeIds)
    const channelIdArray = parseNumberArray(channelIds)

    const { sql, params: queryParams, formatLabel } = buildDynamicQuery(
      metric,
      dimension,
      startDate,
      endDate,
      storeIdArray,
      channelIdArray
    )

    const result = await prisma.$queryRawUnsafe<any[]>(sql, ...queryParams)

    const data = result.map(row => ({
      ...row,
      name: formatLabel(row.name),
      value: serializePrismaData(row.value)
    }))

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Erro na API /api/query:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}