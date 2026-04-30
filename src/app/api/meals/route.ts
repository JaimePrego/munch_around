import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const cuisine = searchParams.get('cuisine') ?? ''

  const meals = await prisma.meal.findMany({
    where: {
      AND: [
        search ? { name: { contains: search } } : {},
        category ? { category } : {},
        cuisine ? { cuisine } : {},
      ],
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(meals)
}

export async function POST(request: Request) {
  const body = await request.json()
  const meal = await prisma.meal.create({
    data: {
      name: body.name,
      prepTime: body.prepTime,
      category: body.category,
      cuisine: body.cuisine,
      mainProtein: body.mainProtein,
      healthScore: body.healthScore,
      preferenceScore: body.preferenceScore,
      defaultPortions: body.defaultPortions ?? 2,
      imageUrl: body.imageUrl ?? null,
      ingredients: JSON.stringify(body.ingredients ?? []),
      tags: JSON.stringify(body.tags ?? []),
      notes: body.notes ?? null,
    },
  })
  return NextResponse.json(meal, { status: 201 })
}
