export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getMondayOfCurrentWeek(): Date {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon ...
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function parseIngredients(json: string): string[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseTags(json: string): string[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export type IngredientCategory =
  | 'Produce'
  | 'Meat & Fish'
  | 'Dairy & Eggs'
  | 'Dry & Pantry'
  | 'Other'

const PRODUCE_KEYWORDS = [
  'tomato', 'onion', 'garlic', 'pepper', 'zucchini', 'eggplant', 'spinach',
  'salad', 'lettuce', 'carrot', 'celery', 'mushroom', 'asparagus', 'broccoli',
  'cauliflower', 'potato', 'sweet potato', 'lemon', 'lime', 'avocado',
  'cucumber', 'arugula', 'basil', 'parsley', 'mint', 'herbs', 'cilantro',
]

const MEAT_FISH_KEYWORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'salmon', 'tuna',
  'shrimp', 'prawn', 'cod', 'anchovy', 'sausage', 'bacon', 'mortadella',
  'ham', 'prosciutto', 'nduja', 'canned tuna', 'fish',
]

const DAIRY_EGGS_KEYWORDS = [
  'cheese', 'mozzarella', 'parmesan', 'ricotta', 'burrata', 'feta', 'cream',
  'butter', 'milk', 'yogurt', 'egg', 'eggs', 'pecorino', 'gorgonzola',
]

const DRY_PANTRY_KEYWORDS = [
  'pasta', 'rice', 'bread', 'flour', 'oil', 'olive oil', 'vinegar', 'sauce',
  'pesto', 'tomato sauce', 'chickpeas', 'lentils', 'beans', 'couscous',
  'quinoa', 'noodles', 'soy sauce', 'spice', 'salt', 'sugar', 'stock',
  'broth', 'canned', 'tin',
]

export function categorizeIngredient(ingredient: string): IngredientCategory {
  const lower = ingredient.toLowerCase()
  if (MEAT_FISH_KEYWORDS.some((k) => lower.includes(k))) return 'Meat & Fish'
  if (DAIRY_EGGS_KEYWORDS.some((k) => lower.includes(k))) return 'Dairy & Eggs'
  if (PRODUCE_KEYWORDS.some((k) => lower.includes(k))) return 'Produce'
  if (DRY_PANTRY_KEYWORDS.some((k) => lower.includes(k))) return 'Dry & Pantry'
  return 'Other'
}

export interface ShoppingItem {
  ingredient: string
  category: IngredientCategory
  meals: string[]
}

export function buildShoppingList(
  mealIngredients: { mealName: string; ingredients: string[] }[]
): Map<IngredientCategory, ShoppingItem[]> {
  const map = new Map<string, ShoppingItem>()

  for (const { mealName, ingredients } of mealIngredients) {
    for (const ingredient of ingredients) {
      const key = ingredient.toLowerCase().trim()
      if (!map.has(key)) {
        map.set(key, {
          ingredient,
          category: categorizeIngredient(ingredient),
          meals: [],
        })
      }
      const item = map.get(key)!
      if (!item.meals.includes(mealName)) {
        item.meals.push(mealName)
      }
    }
  }

  const result = new Map<IngredientCategory, ShoppingItem[]>()
  const categories: IngredientCategory[] = ['Produce', 'Meat & Fish', 'Dairy & Eggs', 'Dry & Pantry', 'Other']
  for (const cat of categories) {
    result.set(cat, [])
  }

  for (const item of Array.from(map.values())) {
    result.get(item.category)!.push(item)
  }

  return result
}

export function parseDefaultSlotConfig(json: string): Record<number, string[]> {
  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}

export function defaultSlotConfig(): Record<number, string[]> {
  return {
    0: ['LUNCH', 'DINNER'],
    1: ['LUNCH', 'DINNER'],
    2: ['LUNCH', 'DINNER'],
    3: ['LUNCH', 'DINNER'],
    4: ['LUNCH', 'DINNER'],
    5: ['DINNER'],
    6: ['DINNER'],
  }
}
