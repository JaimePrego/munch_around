import { parseIngredients, parseTags } from '@/lib/utils'

interface Meal {
  id: string
  name: string
  prepTime: string
  category: string
  cuisine: string
  mainProtein: string
  healthScore: number
  preferenceScore: number
  defaultPortions: number
  imageUrl?: string | null
  ingredients: string
  tags: string
  notes?: string | null
}

interface MealCardProps {
  meal: Meal
  onEdit?: (meal: Meal) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

const PREP_COLORS: Record<string, string> = {
  SHORT: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LONG: 'bg-red-100 text-red-700',
}

const PREP_LABELS: Record<string, string> = {
  SHORT: '⚡ Quick',
  MEDIUM: '🕐 Medium',
  LONG: '👨‍🍳 Long',
}

export default function MealCard({ meal, onEdit, onDelete, compact = false }: MealCardProps) {
  const tags = parseTags(meal.tags)
  const ingredients = parseIngredients(meal.ingredients)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
      {meal.imageUrl && (
        <div className="h-36 overflow-hidden bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-stone-800 leading-tight">{meal.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${PREP_COLORS[meal.prepTime] ?? 'bg-stone-100 text-stone-600'}`}>
            {PREP_LABELS[meal.prepTime] ?? meal.prepTime}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
          <span>{meal.cuisine}</span>
          <span>·</span>
          <span>{meal.category}</span>
          {meal.mainProtein !== 'None' && (
            <>
              <span>·</span>
              <span>{meal.mainProtein}</span>
            </>
          )}
        </div>

        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-700">{meal.healthScore}</div>
            <div className="text-xs text-green-600">Health</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-amber-700">{meal.preferenceScore}</div>
            <div className="text-xs text-amber-600">Taste</div>
          </div>
        </div>

        {!compact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {!compact && ingredients.length > 0 && (
          <p className="text-xs text-stone-400 mb-3 line-clamp-2">
            {ingredients.slice(0, 5).join(', ')}
            {ingredients.length > 5 && ` +${ingredients.length - 5} more`}
          </p>
        )}

        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t border-stone-100">
            {onEdit && (
              <button
                onClick={() => onEdit(meal)}
                className="flex-1 text-xs text-stone-500 hover:text-stone-700 py-1 rounded hover:bg-stone-50 transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(meal.id)}
                className="flex-1 text-xs text-red-400 hover:text-red-600 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
