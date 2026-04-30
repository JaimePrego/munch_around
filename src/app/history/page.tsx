'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Meal {
  id: string
  name: string
}

interface HistoryEntry {
  id: string
  eatenDate: string
  slotType: string
  portions: number
  meal: Meal
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const LIMIT = 20

  const load = async (off: number) => {
    setLoading(true)
    const res = await fetch(`/api/history?limit=${LIMIT}&offset=${off}`)
    const data = await res.json()
    setHistory(data.history)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => {
    load(offset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Meal History</h1>

      {loading ? (
        <div className="text-center py-16 text-stone-400">Loading…</div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          No history yet. Accept a weekly plan to start tracking.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Meal</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Slot</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Portions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-500">{formatDate(entry.eatenDate)}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{entry.meal.name}</td>
                    <td className="px-4 py-3 text-stone-500">
                      {entry.slotType === 'LUNCH' ? '🌞 Lunch' : '🌙 Dinner'}
                    </td>
                    <td className="px-4 py-3 text-right text-stone-500">{entry.portions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-stone-500">
            <span>Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                disabled={offset === 0}
                className="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50"
              >
                ← Prev
              </button>
              <button
                onClick={() => setOffset(offset + LIMIT)}
                disabled={offset + LIMIT >= total}
                className="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
