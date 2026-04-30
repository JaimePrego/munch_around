'use client'

import { useState, useEffect } from 'react'
import MealCard from '@/components/MealCard'

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

const EMPTY_MEAL: Omit<Meal, 'id' | 'ingredients' | 'tags'> & { ingredients: string[]; tags: string[] } = {
  name: '',
  prepTime: 'MEDIUM',
  category: 'Main',
  cuisine: 'Italian',
  mainProtein: 'None',
  healthScore: 7,
  preferenceScore: 7,
  defaultPortions: 2,
  imageUrl: '',
  ingredients: [],
  tags: [],
  notes: '',
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_MEAL, ingredients: '', tags: '' })

  const loadMeals = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterCategory) params.set('category', filterCategory)
    if (filterCuisine) params.set('cuisine', filterCuisine)
    const res = await fetch(`/api/meals?${params}`)
    setMeals(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    loadMeals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterCategory, filterCuisine])

  const openEdit = (meal: Meal) => {
    setEditingMeal(meal)
    let parsedIngredients: string[] = []
    let parsedTags: string[] = []
    try { parsedIngredients = JSON.parse(meal.ingredients) } catch { /* noop */ }
    try { parsedTags = JSON.parse(meal.tags) } catch { /* noop */ }
    setFormData({
      name: meal.name,
      prepTime: meal.prepTime,
      category: meal.category,
      cuisine: meal.cuisine,
      mainProtein: meal.mainProtein,
      healthScore: meal.healthScore,
      preferenceScore: meal.preferenceScore,
      defaultPortions: meal.defaultPortions,
      imageUrl: meal.imageUrl ?? '',
      notes: meal.notes ?? '',
      ingredients: parsedIngredients.join(', '),
      tags: parsedTags.join(', '),
    })
    setShowForm(true)
  }

  const openNew = () => {
    setEditingMeal(null)
    setFormData({ ...EMPTY_MEAL, ingredients: '', tags: '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      ingredients: formData.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((s) => s.trim()).filter(Boolean),
    }
    if (editingMeal) {
      await fetch(`/api/meals/${editingMeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setShowForm(false)
    loadMeals()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meal?')) return
    await fetch(`/api/meals/${id}`, { method: 'DELETE' })
    loadMeals()
  }

  const categories = Array.from(new Set(meals.map((m) => m.category))).sort()
  const cuisines = Array.from(new Set(meals.map((m) => m.cuisine))).sort()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Meal Library</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm"
        >
          + Add Meal
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search meals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white w-48"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterCuisine}
          onChange={(e) => setFilterCuisine(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All cuisines</option>
          {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-sm text-stone-400 self-center">{meals.length} meals</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold text-stone-800 mb-4">
                {editingMeal ? 'Edit Meal' : 'New Meal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input required placeholder="Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />

                <div className="grid grid-cols-2 gap-3">
                  <select value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm">
                    <option value="SHORT">Quick</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LONG">Long</option>
                  </select>
                  <input placeholder="Category" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Cuisine" value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="Main protein" value={formData.mainProtein}
                    onChange={(e) => setFormData({ ...formData, mainProtein: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs text-stone-500">Health score (0-10)</span>
                    <input type="number" min={0} max={10} step={0.5} value={formData.healthScore}
                      onChange={(e) => setFormData({ ...formData, healthScore: parseFloat(e.target.value) })}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mt-0.5" />
                  </label>
                  <label className="block">
                    <span className="text-xs text-stone-500">Taste score (0-10)</span>
                    <input type="number" min={0} max={10} step={0.5} value={formData.preferenceScore}
                      onChange={(e) => setFormData({ ...formData, preferenceScore: parseFloat(e.target.value) })}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mt-0.5" />
                  </label>
                </div>

                <input placeholder="Ingredients (comma-separated)" value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Tags (comma-separated)" value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Notes (optional)" value={formData.notes ?? ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
                    {editingMeal ? 'Save' : 'Add Meal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
