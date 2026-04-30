'use client'

import { useState, useEffect } from 'react'

interface ShoppingItem {
  ingredient: string
  meals: string[]
}

type ShoppingList = Record<string, ShoppingItem[]>

const CATEGORY_ICONS: Record<string, string> = {
  Produce: '🥦',
  'Meat & Fish': '🥩',
  'Dairy & Eggs': '🧀',
  'Dry & Pantry': '🫙',
  Other: '🛍️',
}

export default function ShoppingListPage() {
  const [list, setList] = useState<ShoppingList>({})
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shopping-list')
      .then((r) => r.json())
      .then((data) => {
        setList(data)
        setLoading(false)
      })
  }, [])

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totalItems = Object.values(list).reduce((sum, items) => sum + items.length, 0)
  const checkedCount = checked.size

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Shopping List</h1>
        <span className="text-sm text-stone-500">{checkedCount}/{totalItems} checked</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400">Loading…</div>
      ) : totalItems === 0 ? (
        <div className="text-center py-16 text-stone-400">
          No items. Generate and accept a weekly plan first.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(list).map(([category, items]) =>
            items.length === 0 ? null : (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category] ?? '📦'}</span>
                  <h2 className="font-semibold text-stone-700 text-sm">{category}</h2>
                  <span className="text-xs text-stone-400 ml-auto">{items.length} items</span>
                </div>
                <ul className="divide-y divide-stone-100">
                  {items.map((item) => {
                    const key = item.ingredient.toLowerCase()
                    const isChecked = checked.has(key)
                    return (
                      <li
                        key={key}
                        onClick={() => toggle(key)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isChecked ? 'bg-green-500 border-green-500' : 'border-stone-300'}`}>
                          {isChecked && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isChecked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {item.ingredient}
                          </p>
                          <p className="text-xs text-stone-400 truncate">
                            {item.meals.join(', ')}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
