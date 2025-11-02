import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { BaseQuerySchema, serializePrismaData } from '@/lib/api-helpers'
import { z } from 'zod'

const TimeSeriesQuerySchema = BaseQuerySchema.extend({
  timeBucket: z.enum(['hour', 'day', 'week', 'month']).default('day')
})

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
      timeBucket: searchParams.get('timeBucket'),
    }
    const validation = TimeSeriesQuerySchema.safeParse(params)
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '))
    }

    const { startDate, endDate, storeIds, channelIds, timeBucket } = validation.data
    const storeIdArray = parseNumberArray(storeIds)
    const channelIdArray = parseNumberArray(channelIds)
    
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        DATE_TRUNC('${timeBucket}', created_at) AS time_bucket,
        SUM(total_amount) AS total_revenue,
        COUNT(id) AS total_sales,
        AVG(total_amount) AS avg_ticket
      FROM sales
      WHERE
        sale_status_desc = 'COMPLETED'
        AND created_at BETWEEN $1::timestamp AND $2::timestamp
        AND ($3::int[] IS NULL OR store_id = ANY($3::int[]))
        AND ($4::int[] IS NULL OR channel_id = ANY($4::int[]))
      GROUP BY 1
      ORDER BY 1;
    `, startDate, endDate, storeIdArray, channelIdArray)
    
    return NextResponse.json(serializePrismaData(result))

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}