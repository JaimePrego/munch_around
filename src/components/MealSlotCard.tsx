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

interface MealSlotCardProps {
  slot: MealSlot
  allMeals: Meal[]
  onChangeMeal: (slotId: string, mealId: string | null) => void
  onToggleLock: (slotId: string, locked: boolean) => void
  readOnly?: boolean
}

const PREP_EMOJI: Record<string, string> = {
  SHORT: '⚡',
  MEDIUM: '🕐',
  LONG: '👨‍🍳',
}

export default function MealSlotCard({
  slot,
  allMeals,
  onChangeMeal,
  onToggleLock,
  readOnly = false,
}: MealSlotCardProps) {
  const slotLabel = slot.slotType === 'LUNCH' ? '🌞 Lunch' : '🌙 Dinner'

  return (
    <div className={`rounded-lg border p-3 ${slot.locked ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-500">{slotLabel}</span>
        {!readOnly && (
          <button
            onClick={() => onToggleLock(slot.id, !slot.locked)}
            className="text-sm"
            title={slot.locked ? 'Unlock' : 'Lock'}
          >
            {slot.locked ? '🔒' : '🔓'}
          </button>
        )}
      </div>

      {slot.meal ? (
        <div>
          <p className="text-sm font-medium text-stone-800 leading-tight mb-1">
            {PREP_EMOJI[slot.meal.prepTime] ?? ''} {slot.meal.name}
          </p>
          {slot.score !== null && (
            <p className="text-xs text-stone-400">Score: {slot.score.toFixed(1)}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-stone-400 italic">No meal assigned</p>
      )}

      {!readOnly && (
        <select
          className="mt-2 w-full text-xs border border-stone-200 rounded px-1.5 py-1 bg-white text-stone-700"
          value={slot.mealId ?? ''}
          onChange={(e) => onChangeMeal(slot.id, e.target.value || null)}
          disabled={slot.locked}
        >
          <option value="">— Change meal —</option>
          {allMeals.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
