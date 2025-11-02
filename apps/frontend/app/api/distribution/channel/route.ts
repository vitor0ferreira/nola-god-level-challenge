import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateQueryParams, serializePrismaData } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const { startDate, endDate, storeIdArray, channelIdArray } = validateQueryParams(searchParams)

    const result = await prisma.$queryRaw<any[]>`
      SELECT
        c.name AS channel_name,
        SUM(s.total_amount) AS total_revenue,
        COUNT(s.id) AS total_sales
      FROM sales s
      JOIN channels c ON c.id = s.channel_id
      WHERE
        s.sale_status_desc = 'COMPLETED'
        AND s.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
        AND (${storeIdArray}::int[] IS NULL OR s.store_id = ANY(${storeIdArray}::int[]))
        AND (${channelIdArray}::int[] IS NULL OR s.channel_id = ANY(${channelIdArray}::int[]))
      GROUP BY 1
      ORDER BY 2 DESC;
    `
    
    return NextResponse.json(serializePrismaData(result))

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}