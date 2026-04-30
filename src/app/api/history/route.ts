import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const [history, total] = await Promise.all([
    prisma.mealHistory.findMany({
      orderBy: { eatenDate: 'desc' },
      take: limit,
      skip: offset,
      include: { meal: true },
    }),
    prisma.mealHistory.count(),
  ])

  return NextResponse.json({ history, total })
}
