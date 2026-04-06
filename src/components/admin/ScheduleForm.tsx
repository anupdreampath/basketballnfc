'use client'

import { useState, useEffect } from 'react'
import type { Schedule, Preset, Difficulty } from '@/types'
import { DIFFICULTY_LABELS } from '@/types'

interface Props {
  existing?: Schedule
  prefillDate?: Date
  onSave: (schedule: Schedule) => void
  onCancel: () => void
}

function toDateValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toTimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ScheduleForm({ existing, prefillDate, onSave, onCancel }: Props) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [presetId, setPresetId] = useState('')
  const [date, setDate] = useState(
    existing ? toDateValue(new Date(existing.starts_at))
      : prefillDate ? toDateValue(prefillDate) : ''
  )
  const [startTime, setStartTime] = useState(
    existing ? toTimeValue(new Date(existing.starts_at)) : '09:00'
  )
  const [endTime, setEndTime] = useState(
    existing ? toTimeValue(new Date(existing.ends_at)) : '23:00'
  )
  const [label, setLabel] = useState(existing?.label ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/presets')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        setPresets(arr)
        if (existing?.preset_id && arr.length > 0) {
          const match = arr.find((p: Preset) => p.id === existing.preset_id)
          if (match) setPresetId(match.id)
        }
      })
      .catch(() => { setPresets([]); setError('Failed to load presets') })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!presetId || !date || !startTime || !endTime) return
    setError(null)
    setSaving(true)

    const preset = presets.find(p => p.id === presetId)
    if (!preset) { setError('Select a preset'); setSaving(false); return }

    const starts_at = new Date(`${date}T${startTime}:00`).toISOString()
    const ends_at = new Date(`${date}T${endTime}:00`).toISOString()

    const url = existing ? `/api/schedules/${existing.id}` : '/api/schedules'
    const method = existing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preset_id: preset.id,
        move_name: preset.override_move_name || preset.front_page_title || preset.name,
        difficulty: preset.default_difficulty || null,
        starts_at, ends_at,
        label: label.trim() || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
    onSave(data)
    setSaving(false)
  }

  const selected = presets.find(p => p.id === presetId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1">Preset</label>
        <select value={presetId} onChange={e => setPresetId(e.target.value)} required
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
          <option value="">-- Select a preset --</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {presets.length === 0 && (
          <p className="text-yellow-600 text-xs mt-1">Create presets in Settings first.</p>
        )}
      </div>

      {selected && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-xs space-y-1.5">
          {selected.front_page_title && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Title:</span>
              <span className="text-white">{selected.front_page_title}</span>
            </div>
          )}
          {selected.default_difficulty && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Difficulty:</span>
              <span className={`font-semibold ${
                selected.default_difficulty === 'beginner' ? 'text-green-300'
                  : selected.default_difficulty === 'intermediate' ? 'text-orange-300'
                  : 'text-red-300'
              }`}>{DIFFICULTY_LABELS[selected.default_difficulty]}</span>
            </div>
          )}
          {selected.move_description && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Desc:</span>
              <span className="text-gray-300 line-clamp-1">{selected.move_description}</span>
            </div>
          )}
          {selected.move_level && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Level:</span>
              <span className="text-gray-300">{selected.move_level}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-gray-400 text-xs mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Start</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]" />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">End</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]" />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-xs mb-1">Label <span className="text-gray-600">(optional)</span></label>
        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
          placeholder="e.g. Week 1 - Beginner Focus"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600" />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 text-gray-400 border border-zinc-700 hover:border-zinc-500 rounded-lg py-2 text-sm transition-colors">Cancel</button>
        <button type="submit" disabled={saving || presets.length === 0}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors">
          {saving ? 'Saving...' : existing ? 'Update' : 'Schedule'}
        </button>
      </div>
    </form>
  )
}
