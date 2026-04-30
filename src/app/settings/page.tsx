'use client'

import { useState, useEffect } from 'react'
import { DAY_NAMES } from '@/lib/utils'

interface Settings {
  id: string
  defaultSlotConfig: string
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [slotConfig, setSlotConfig] = useState<Record<number, string[]>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data)
        try {
          setSlotConfig(JSON.parse(data.defaultSlotConfig))
        } catch {
          setSlotConfig({})
        }
      })
  }, [])

  const toggleSlot = (day: number, slotType: string) => {
    setSlotConfig((prev) => {
      const daySlots = prev[day] ?? []
      const next = daySlots.includes(slotType)
        ? daySlots.filter((s) => s !== slotType)
        : [...daySlots, slotType]
      return { ...prev, [day]: next }
    })
  }

  const updateWeight = (key: keyof Settings, value: number) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, defaultSlotConfig: slotConfig }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) return <div className="text-center py-16 text-stone-400">Loading…</div>

  const weightFields: { key: keyof Settings; label: string }[] = [
    { key: 'preferenceWeight', label: 'Preference / Taste' },
    { key: 'healthWeight', label: 'Health' },
    { key: 'freshnessWeight', label: 'Freshness' },
    { key: 'varietyWeight', label: 'Variety' },
    { key: 'prepSuitabilityWeight', label: 'Prep Suitability' },
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Settings</h1>

      <div className="space-y-6">
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-4">Meal Slots per Day</h2>
          <div className="space-y-2">
            {DAY_NAMES.map((dayName, dayIndex) => {
              const daySlots = slotConfig[dayIndex] ?? []
              return (
                <div key={dayIndex} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-stone-600">{dayName}</span>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={daySlots.includes('LUNCH')}
                      onChange={() => toggleSlot(dayIndex, 'LUNCH')}
                      className="rounded"
                    />
                    Lunch
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={daySlots.includes('DINNER')}
                      onChange={() => toggleSlot(dayIndex, 'DINNER')}
                      className="rounded"
                    />
                    Dinner
                  </label>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-4">Scoring Weights</h2>
          <div className="space-y-4">
            {weightFields.map(({ key, label }) => (
              <label key={key} className="block">
                <div className="flex justify-between text-sm text-stone-600 mb-1">
                  <span>{label}</span>
                  <span className="font-medium">{(settings[key] as number).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={settings[key] as number}
                  onChange={(e) => updateWeight(key, parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-4">Advanced Options</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Prefer long prep meals on weekends</span>
              <input
                type="checkbox"
                checked={settings.preferLongMealsOnWeekends}
                onChange={(e) => setSettings({ ...settings, preferLongMealsOnWeekends: e.target.checked })}
                className="rounded"
              />
            </label>
            <label className="block">
              <div className="flex justify-between text-sm text-stone-600 mb-1">
                <span>Max long-prep meals per week</span>
                <span className="font-medium">{settings.maxLongPrepMealsPerWeek}</span>
              </div>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={settings.maxLongPrepMealsPerWeek}
                onChange={(e) => setSettings({ ...settings, maxLongPrepMealsPerWeek: parseInt(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </label>
            <label className="block">
              <div className="flex justify-between text-sm text-stone-600 mb-1">
                <span>Target average health score</span>
                <span className="font-medium">{settings.targetAverageHealthScore.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={settings.targetAverageHealthScore}
                onChange={(e) => setSettings({ ...settings, targetAverageHealthScore: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
