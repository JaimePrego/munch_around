import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { slotId } = await params
  const body = await request.json()

  const slot = await prisma.mealSlot.update({
    where: { id: slotId },
    data: {
      mealId: body.mealId ?? undefined,
      portions: body.portions ?? undefined,
      locked: body.locked ?? undefined,
    },
    include: { meal: true },
  })
  return NextResponse.json(slot)
}
