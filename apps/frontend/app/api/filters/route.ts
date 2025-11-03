import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializePrismaData, validateQueryParams } from "@/lib/api-helpers";

export async function GET(request: Request){
  try {
    const { searchParams } = new URL(request.url)
    const { startDate, endDate } = validateQueryParams(searchParams)

    const stores = await prisma.stores.findMany({
        select: {
            id: true,
            name: true
        },
        where:{
            is_active: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    const channels = await prisma.channels.findMany({
        select:{
            id: true,
            name: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    const products = await prisma.$queryRaw<any[]>`
    SELECT
        p.id,
        p.name
      FROM product_sales ps
      JOIN products p ON p.id = ps.product_id
      JOIN sales s ON s.id = ps.sale_id
      WHERE
        s.sale_status_desc = 'COMPLETED'
        AND s.created_at BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
      GROUP BY p.id, p.name
      ORDER BY SUM(ps.quantity) DESC
      LIMIT 100
    `;

    return NextResponse.json(serializePrismaData({ stores, channels, products }));

  } catch (error: any) {
      console.error("Erro ao buscar dados para filtros:", error);
      return NextResponse.json(
        { error: "Erro interno ao buscar dados de filtro." }, 
        { status: 500 }
      );
  }
}