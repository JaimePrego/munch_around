import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { selectMealsForPlan } from '@/lib/mealScoring'
import { getMondayOfCurrentWeek, parseDefaultSlotConfig, defaultSlotConfig } from '@/lib/utils'

export async function GET() {
  const plan = await prisma.weeklyPlan.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      mealSlots: {
        include: { meal: true },
        orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }],
      },
    },
  })
  return NextResponse.json(plan)
}

export async function POST() {
  const settings = await prisma.plannerSettings.findFirst()
  if (!settings) {
    return NextResponse.json({ error: 'Settings not found' }, { status: 400 })
  }

  const meals = await prisma.meal.findMany()
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const history = await prisma.mealHistory.findMany({
    where: { eatenDate: { gte: twoWeeksAgo } },
  })

  const slotConfig: Record<number, string[]> = settings.defaultSlotConfig
    ? parseDefaultSlotConfig(settings.defaultSlotConfig)
    : defaultSlotConfig()

  const slots: { dayOfWeek: number; slotType: string }[] = []
  for (let day = 0; day <= 6; day++) {
    const slotTypes = slotConfig[day] ?? []
    for (const slotType of slotTypes) {
      slots.push({ dayOfWeek: day, slotType })
    }
  }

  const selections = selectMealsForPlan(meals, history, slots, settings)

  const weekStart = getMondayOfCurrentWeek()
  const plan = await prisma.weeklyPlan.create({
    data: {
      weekStartDate: weekStart,
      status: 'DRAFT',
      mealSlots: {
        create: slots.map(({ dayOfWeek, slotType }) => {
          const key = `${dayOfWeek}-${slotType}`
          const selected = selections.get(key)
          return {
            dayOfWeek,
            slotType,
            mealId: selected?.meal.id ?? null,
            portions: selected?.meal.defaultPortions ?? 2,
            score: selected?.score ?? null,
            explanation: selected?.explanation ?? null,
          }
        }),
      },
    },
    include: {
      mealSlots: {
        include: { meal: true },
        orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }],
      },
    },
  })

  return NextResponse.json(plan, { status: 201 })
}
