import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { BaseQuerySchema, serializePrismaData } from '@/lib/api-helpers'
import { z } from 'zod'

const ProductQuerySchema = BaseQuerySchema.extend({
  categoryIds: z.string().optional().nullable(),
  orderBy: z.enum(['units_sold', 'revenue_generated']).default('units_sold')
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
      categoryIds: searchParams.get('categoryIds'),
      orderBy: searchParams.get('orderBy'),
    }
    const validation = ProductQuerySchema.safeParse(params)
    if (!validation.success) {
      throw new Error(validation.error.errors.map(e => e.message).join(', '))
    }

    const { startDate, endDate, storeIds, channelIds, categoryIds, orderBy } = validation.data
    const storeIdArray = parseNumberArray(storeIds)
    const channelIdArray = parseNumberArray(channelIds)
    const categoryIdArray = parseNumberArray(categoryIds)
    
    const orderByClause = orderBy === 'revenue_generated' ? '4 DESC' : '3 DESC'

    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        p.name AS product_name,
        cat.name AS category_name,
        SUM(ps.quantity) AS units_sold,
        SUM(ps.total_price) AS revenue_generated
      FROM product_sales ps
      JOIN products p ON p.id = ps.product_id
      LEFT JOIN categories cat ON cat.id = p.category_id
      JOIN sales s ON s.id = ps.sale_id
      WHERE
        s.sale_status_desc = 'COMPLETED'
        AND s.created_at BETWEEN $1::timestamp AND $2::timestamp
        AND ($3::int[] IS NULL OR s.store_id = ANY($3::int[]))
        AND ($4::int[] IS NULL OR s.channel_id = ANY($4::int[]))
        AND ($5::int[] IS NULL OR p.category_id = ANY($5::int[]))
      GROUP BY 1, 2
      ORDER BY ${orderByClause}
      LIMIT 20;
    `, startDate, endDate, storeIdArray, channelIdArray, categoryIdArray)
    
    return NextResponse.json(serializePrismaData(result))

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}