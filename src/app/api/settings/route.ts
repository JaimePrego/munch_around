import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultSlotConfig } from '@/lib/utils'

export async function GET() {
  let settings = await prisma.plannerSettings.findFirst()
  if (!settings) {
    settings = await prisma.plannerSettings.create({
      data: {
        defaultSlotConfig: JSON.stringify(defaultSlotConfig()),
        preferenceWeight: 3,
        healthWeight: 2,
        freshnessWeight: 3,
        varietyWeight: 2,
        prepSuitabilityWeight: 2,
        varietyStrictness: 1,
        freshnessPenaltyStrength: 1,
        maxLongPrepMealsPerWeek: 2,
        preferLongMealsOnWeekends: true,
        targetAverageHealthScore: 7,
      },
    })
  }
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const body = await request.json()
  let settings = await prisma.plannerSettings.findFirst()

  if (settings) {
    settings = await prisma.plannerSettings.update({
      where: { id: settings.id },
      data: {
        defaultSlotConfig: body.defaultSlotConfig
          ? JSON.stringify(body.defaultSlotConfig)
          : undefined,
        preferenceWeight: body.preferenceWeight,
        healthWeight: body.healthWeight,
        freshnessWeight: body.freshnessWeight,
        varietyWeight: body.varietyWeight,
        prepSuitabilityWeight: body.prepSuitabilityWeight,
        varietyStrictness: body.varietyStrictness,
        freshnessPenaltyStrength: body.freshnessPenaltyStrength,
        maxLongPrepMealsPerWeek: body.maxLongPrepMealsPerWeek,
        preferLongMealsOnWeekends: body.preferLongMealsOnWeekends,
        targetAverageHealthScore: body.targetAverageHealthScore,
      },
    })
  } else {
    settings = await prisma.plannerSettings.create({
      data: {
        defaultSlotConfig: JSON.stringify(body.defaultSlotConfig ?? defaultSlotConfig()),
        preferenceWeight: body.preferenceWeight ?? 3,
        healthWeight: body.healthWeight ?? 2,
        freshnessWeight: body.freshnessWeight ?? 3,
        varietyWeight: body.varietyWeight ?? 2,
        prepSuitabilityWeight: body.prepSuitabilityWeight ?? 2,
        varietyStrictness: body.varietyStrictness ?? 1,
        freshnessPenaltyStrength: body.freshnessPenaltyStrength ?? 1,
        maxLongPrepMealsPerWeek: body.maxLongPrepMealsPerWeek ?? 2,
        preferLongMealsOnWeekends: body.preferLongMealsOnWeekends ?? true,
        targetAverageHealthScore: body.targetAverageHealthScore ?? 7,
      },
    })
  }
  return NextResponse.json(settings)
}
