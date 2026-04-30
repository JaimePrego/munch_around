import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meal = await prisma.meal.findUnique({ where: { id } })
  if (!meal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(meal)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const meal = await prisma.meal.update({
    where: { id },
    data: {
      name: body.name,
      prepTime: body.prepTime,
      category: body.category,
      cuisine: body.cuisine,
      mainProtein: body.mainProtein,
      healthScore: body.healthScore,
      preferenceScore: body.preferenceScore,
      defaultPortions: body.defaultPortions,
      imageUrl: body.imageUrl,
      ingredients: JSON.stringify(body.ingredients ?? []),
      tags: JSON.stringify(body.tags ?? []),
      notes: body.notes,
    },
  })
  return NextResponse.json(meal)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.meal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
