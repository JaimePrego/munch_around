import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id },
    include: {
      mealSlots: {
        include: { meal: true },
        orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }],
      },
    },
  })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plan)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.weeklyPlan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
