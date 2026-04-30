import type { Meal, MealHistory, PlannerSettings } from '@prisma/client'

export interface ScoringWeights {
  preferenceWeight: number
  healthWeight: number
  freshnessWeight: number
  varietyWeight: number
  prepSuitabilityWeight: number
  varietyStrictness: number
  freshnessPenaltyStrength: number
  maxLongPrepMealsPerWeek: number
  preferLongMealsOnWeekends: boolean
  targetAverageHealthScore: number
}

export interface SlotContext {
  dayOfWeek: number   // 0=Mon, 6=Sun
  slotType: string    // 'LUNCH' | 'DINNER'
  existingMealsThisWeek: string[] // meal IDs already placed
  longPrepCountThisWeek: number
}

export interface ScoredMeal {
  meal: Meal
  score: number
  explanation: string
}

const DAYS_FOR_FRESHNESS = 14

export function scoreMeal(
  meal: Meal,
  recentHistory: MealHistory[],
  context: SlotContext,
  weights: ScoringWeights
): ScoredMeal {
  const explanations: string[] = []

  // ---- 1. Preference score (0-10) normalized to 0-1
  const preferenceNorm = meal.preferenceScore / 10
  const preferenceContrib = preferenceNorm * weights.preferenceWeight
  explanations.push(`pref=${preferenceNorm.toFixed(2)}`)

  // ---- 2. Health score (0-10) normalized to 0-1
  const healthNorm = meal.healthScore / 10
  const healthContrib = healthNorm * weights.healthWeight
  explanations.push(`health=${healthNorm.toFixed(2)}`)

  // ---- 3. Freshness penalty: how recently was this meal eaten?
  const sortedRecent = recentHistory
    .filter((h) => h.mealId === meal.id)
    .sort((a, b) => new Date(b.eatenDate).getTime() - new Date(a.eatenDate).getTime())

  let freshnessPenalty = 0
  if (sortedRecent.length > 0) {
    const lastEaten = new Date(sortedRecent[0].eatenDate)
    const daysAgo = (Date.now() - lastEaten.getTime()) / (1000 * 60 * 60 * 24)
    if (daysAgo < DAYS_FOR_FRESHNESS) {
      freshnessPenalty =
        ((DAYS_FOR_FRESHNESS - daysAgo) / DAYS_FOR_FRESHNESS) *
        weights.freshnessPenaltyStrength
      explanations.push(`freshnessPenalty=${freshnessPenalty.toFixed(2)}(${Math.round(daysAgo)}d ago)`)
    }
  }
  const freshnessContrib =
    weights.freshnessWeight * (1 - Math.min(1, freshnessPenalty))

  // ---- 4. Variety penalty: already in the current week plan?
  let varietyPenalty = 0
  const alreadyThisWeek = context.existingMealsThisWeek.filter(
    (id) => id === meal.id
  ).length
  if (alreadyThisWeek > 0) {
    varietyPenalty = weights.varietyStrictness * alreadyThisWeek
    explanations.push(`varietyPenalty=${varietyPenalty.toFixed(2)}(used ${alreadyThisWeek}x)`)
  }
  const varietyContrib = weights.varietyWeight * Math.max(0, 1 - varietyPenalty)

  // ---- 5. Prep suitability: LONG prep meals preferred on weekends
  let prepSuitability = 0.5
  const isWeekend = context.dayOfWeek >= 5 // Sat=5, Sun=6
  if (meal.prepTime === 'SHORT') {
    prepSuitability = isWeekend ? 0.3 : 0.8
  } else if (meal.prepTime === 'MEDIUM') {
    prepSuitability = 0.6
  } else if (meal.prepTime === 'LONG') {
    if (isWeekend) {
      prepSuitability = 0.9
    } else if (
      weights.preferLongMealsOnWeekends &&
      context.longPrepCountThisWeek >= weights.maxLongPrepMealsPerWeek
    ) {
      prepSuitability = 0.1
      explanations.push('longPrepLimit')
    } else {
      prepSuitability = 0.4
    }
  }
  const prepContrib = prepSuitability * weights.prepSuitabilityWeight
  explanations.push(`prep=${prepSuitability.toFixed(2)}`)

  const totalWeight =
    weights.preferenceWeight +
    weights.healthWeight +
    weights.freshnessWeight +
    weights.varietyWeight +
    weights.prepSuitabilityWeight

  const rawScore =
    preferenceContrib +
    healthContrib +
    freshnessContrib +
    varietyContrib +
    prepContrib

  const score = (rawScore / totalWeight) * 10

  return {
    meal,
    score,
    explanation: explanations.join(', '),
  }
}

export function selectMealsForPlan(
  meals: Meal[],
  history: MealHistory[],
  slots: { dayOfWeek: number; slotType: string }[],
  settings: PlannerSettings
): Map<string, ScoredMeal> {
  const weights: ScoringWeights = {
    preferenceWeight: settings.preferenceWeight,
    healthWeight: settings.healthWeight,
    freshnessWeight: settings.freshnessWeight,
    varietyWeight: settings.varietyWeight,
    prepSuitabilityWeight: settings.prepSuitabilityWeight,
    varietyStrictness: settings.varietyStrictness,
    freshnessPenaltyStrength: settings.freshnessPenaltyStrength,
    maxLongPrepMealsPerWeek: settings.maxLongPrepMealsPerWeek,
    preferLongMealsOnWeekends: settings.preferLongMealsOnWeekends,
    targetAverageHealthScore: settings.targetAverageHealthScore,
  }

  const result = new Map<string, ScoredMeal>()
  const placedMealIds: string[] = []
  let longPrepCount = 0

  for (const slot of slots) {
    const slotKey = `${slot.dayOfWeek}-${slot.slotType}`
    const context: SlotContext = {
      dayOfWeek: slot.dayOfWeek,
      slotType: slot.slotType,
      existingMealsThisWeek: [...placedMealIds],
      longPrepCountThisWeek: longPrepCount,
    }

    const scored = meals
      .map((meal) => scoreMeal(meal, history, context, weights))
      .sort((a, b) => b.score - a.score)

    const best = scored[0]
    if (best) {
      result.set(slotKey, best)
      placedMealIds.push(best.meal.id)
      if (best.meal.prepTime === 'LONG') longPrepCount++
    }
  }

  return result
}

export function defaultWeightsFromSettings(settings: PlannerSettings): ScoringWeights {
  return {
    preferenceWeight: settings.preferenceWeight,
    healthWeight: settings.healthWeight,
    freshnessWeight: settings.freshnessWeight,
    varietyWeight: settings.varietyWeight,
    prepSuitabilityWeight: settings.prepSuitabilityWeight,
    varietyStrictness: settings.varietyStrictness,
    freshnessPenaltyStrength: settings.freshnessPenaltyStrength,
    maxLongPrepMealsPerWeek: settings.maxLongPrepMealsPerWeek,
    preferLongMealsOnWeekends: settings.preferLongMealsOnWeekends,
    targetAverageHealthScore: settings.targetAverageHealthScore,
  }
}
