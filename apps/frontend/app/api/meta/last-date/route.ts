import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { serializePrismaData } from '@/lib/api-helpers'

export async function GET() {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT MAX(created_at) as last_date FROM sales`
    const lastDate = result[0]?.last_date ?? null
    return NextResponse.json(serializePrismaData({ lastDate }))
  } catch (error: any) {
    console.error('Erro ao obter última data:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
