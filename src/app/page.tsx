'use client'

import { useState, useEffect, useCallback } from 'react'
import MealSlotCard from '@/components/MealSlotCard'
import { DAY_NAMES, formatDate } from '@/lib/utils'

interface Meal {
  id: string
  name: string
  prepTime: string
  category: string
}

interface MealSlot {
  id: string
  dayOfWeek: number
  slotType: string
  mealId: string | null
  portions: number
  locked: boolean
  score: number | null
  meal: Meal | null
}

interface WeeklyPlan {
  id: string
  weekStartDate: string
  status: string
  acceptedAt: string | null
  mealSlots: MealSlot[]
}

export default function Home() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [allMeals, setAllMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const loadPlan = useCallback(async () => {
    setLoading(true)
    const [planRes, mealsRes] = await Promise.all([
      fetch('/api/weekly-plan'),
      fetch('/api/meals'),
    ])
    const planData = await planRes.json()
    const mealsData = await mealsRes.json()
    setPlan(planData)
    setAllMeals(mealsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  async function generatePlan() {
    setGenerating(true)
    const res = await fetch('/api/weekly-plan', { method: 'POST' })
    const newPlan = await res.json()
    setPlan(newPlan)
    setGenerating(false)
  }

  async function acceptPlan() {
    if (!plan) return
    setAccepting(true)
    const res = await fetch(`/api/weekly-plan/${plan.id}/accept`, { method: 'POST' })
    const updated = await res.json()
    setPlan(updated)
    setAccepting(false)
  }

  async function handleChangeMeal(slotId: string, mealId: string | null) {
    if (!plan) return
    const res = await fetch(`/api/weekly-plan/${plan.id}/slots/${slotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealId }),
    })
    const updated = await res.json()
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            mealSlots: prev.mealSlots.map((s) => (s.id === slotId ? updated : s)),
          }
        : prev
    )
  }

  async function handleToggleLock(slotId: string, locked: boolean) {
    if (!plan) return
    const res = await fetch(`/api/weekly-plan/${plan.id}/slots/${slotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked }),
    })
    const updated = await res.json()
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            mealSlots: prev.mealSlots.map((s) => (s.id === slotId ? updated : s)),
          }
        : prev
    )
  }

  const slotsByDay = (dayOfWeek: number) =>
    plan?.mealSlots.filter((s) => s.dayOfWeek === dayOfWeek) ?? []

  const isAccepted = plan?.status === 'ACCEPTED'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Weekly Planner</h1>
          {plan && (
            <p className="text-sm text-stone-500 mt-0.5">
              Week of {formatDate(plan.weekStartDate)}
              {isAccepted && <span className="ml-2 text-green-600 font-medium">✓ Accepted</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={generatePlan}
            disabled={generating || loading}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors text-sm"
          >
            {generating ? 'Generating…' : plan ? '🔄 Regenerate' : '✨ Generate Plan'}
          </button>
          {plan && !isAccepted && (
            <button
              onClick={acceptPlan}
              disabled={accepting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {accepting ? 'Accepting…' : '✓ Accept Plan'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400">Loading…</div>
      ) : !plan ? (
        <div className="text-center py-16">
          <p className="text-stone-500 mb-4">No plan yet. Generate your first meal plan!</p>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating…' : '✨ Generate Plan'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const daySlots = slotsByDay(dayIndex)
            return (
              <div key={dayIndex} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-800 text-white text-center py-2 px-3">
                  <div className="font-semibold text-sm">{dayName}</div>
                </div>
                <div className="p-3 space-y-2">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4">No slots</p>
                  ) : (
                    daySlots.map((slot) => (
                      <MealSlotCard
                        key={slot.id}
                        slot={slot}
                        allMeals={allMeals}
                        onChangeMeal={handleChangeMeal}
                        onToggleLock={handleToggleLock}
                        readOnly={isAccepted}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
