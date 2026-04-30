import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id },
    include: { mealSlots: true },
  })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  await prisma.weeklyPlan.update({
    where: { id },
    data: { status: 'ACCEPTED', acceptedAt: now },
  })

  const historyEntries = plan.mealSlots
    .filter((slot) => slot.mealId)
    .map((slot) => {
      const dayOffset = slot.dayOfWeek
      const eatenDate = new Date(plan.weekStartDate)
      eatenDate.setDate(eatenDate.getDate() + dayOffset)
      return {
        mealId: slot.mealId!,
        eatenDate,
        slotType: slot.slotType,
        weeklyPlanId: id,
        portions: slot.portions,
      }
    })

  await prisma.mealHistory.createMany({ data: historyEntries })

  const updated = await prisma.weeklyPlan.findUnique({
    where: { id },
    include: {
      mealSlots: {
        include: { meal: true },
        orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }],
      },
    },
  })

  return NextResponse.json(updated)
}
