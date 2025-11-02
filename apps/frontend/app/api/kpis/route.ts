import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateQueryParams, serializePrismaData } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { startDate, endDate, storeIdArray, channelIdArray } = validateQueryParams(searchParams)

    const result = await prisma.$queryRaw<any[]>`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(COUNT(id), 0) AS total_sales,
        COALESCE(AVG(total_amount), 0) AS avg_ticket,
        COALESCE(SUM(total_discount), 0) AS total_discount,
        COALESCE(COUNT(id) FILTER (WHERE sale_status_desc = 'CANCELLED'), 0) AS total_cancelled
      FROM sales
      WHERE
        created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
        AND (${storeIdArray}::int[] IS NULL OR store_id = ANY(${storeIdArray}::int[]))
        AND (${channelIdArray}::int[] IS NULL OR channel_id = ANY(${channelIdArray}::int[]))
    `
    
    const kpis = result[0]
    return NextResponse.json(serializePrismaData(kpis))

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}