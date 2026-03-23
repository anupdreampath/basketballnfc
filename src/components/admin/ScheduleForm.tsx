'use client'

import { useState, useEffect } from 'react'
import type { Schedule, MoveInfo } from '@/types'

interface Props {
  existing?: Schedule
  onSave: (schedule: Schedule) => void
  onCancel: () => void
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ScheduleForm({ existing, onSave, onCancel }: Props) {
  const [moves, setMoves] = useState<MoveInfo[]>([])
  const [moveName, setMoveName] = useState(existing?.move_name ?? '')
  const [startsAt, setStartsAt] = useState(existing ? toLocalDatetimeValue(existing.starts_at) : '')
  const [endsAt, setEndsAt] = useState(existing ? toLocalDatetimeValue(existing.ends_at) : '')
  const [label, setLabel] = useState(existing?.label ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/moves').then(r => r.json()).then(setMoves)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!moveName || !startsAt || !endsAt) return
    setError(null)
    setSaving(true)

    const url = existing ? `/api/schedules/${existing.id}` : '/api/schedules'
    const method = existing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        move_name: moveName,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        label: label.trim() || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
    onSave(data)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-400 text-sm mb-1">Move</label>
        <select
          value={moveName}
          onChange={(e) => setMoveName(e.target.value)}
          required
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        >
          <option value="">— Select a move —</option>
          {moves.map((m) => (
            <option key={m.move_name} value={m.move_name}>
              {m.move_name} ({m.difficulties.join(', ')})
            </option>
          ))}
        </select>
        {moves.length === 0 && <p className="text-yellow-600 text-xs mt-1">Upload videos first to create moves.</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Start</label>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">End</label>
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required min={startsAt}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]" />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Label <span className="text-gray-600">(optional)</span></label>
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Game Night — March 22"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600" />
      </div>

      {error && <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 text-gray-400 border border-zinc-700 hover:border-zinc-500 rounded-lg py-2 text-sm">Cancel</button>
        <button type="submit" disabled={saving || moves.length === 0} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm">
          {saving ? 'Saving…' : existing ? 'Update' : 'Schedule Move'}
        </button>
      </div>
    </form>
  )
}
