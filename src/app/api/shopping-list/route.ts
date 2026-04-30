import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIngredients, buildShoppingList } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const planId = searchParams.get('planId')

  let mealSlots
  if (planId) {
    mealSlots = await prisma.mealSlot.findMany({
      where: { weeklyPlanId: planId, mealId: { not: null } },
      include: { meal: true },
    })
  } else {
    const plan = await prisma.weeklyPlan.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    if (!plan) return NextResponse.json({})
    mealSlots = await prisma.mealSlot.findMany({
      where: { weeklyPlanId: plan.id, mealId: { not: null } },
      include: { meal: true },
    })
  }

  const mealIngredients = mealSlots
    .filter((s) => s.meal)
    .map((s) => ({
      mealName: s.meal!.name,
      ingredients: parseIngredients(s.meal!.ingredients),
    }))

  const grouped = buildShoppingList(mealIngredients)
  const result: Record<string, { ingredient: string; meals: string[] }[]> = {}
  for (const [category, items] of Array.from(grouped.entries())) {
    if (items.length > 0) {
      result[category] = items.map((i) => ({ ingredient: i.ingredient, meals: i.meals }))
    }
  }

  return NextResponse.json(result)
}
