'use client'

import { useState, useEffect } from 'react'
import type { Schedule, Preset, Difficulty } from '@/types'
import { DIFFICULTY_LABELS } from '@/types'

interface Props {
  weekStart: Date
  onCreated: (schedules: Schedule[]) => void
  onCancel: () => void
}

type PatternDay = {
  enabled: boolean
}

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function BulkScheduleForm({
  weekStart,
  onCreated,
  onCancel,
}: Props) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [presetId, setPresetId] = useState('')
  const [mode, setMode] = useState<'pattern' | 'quick'>('pattern')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('23:00')
  const [repeatWeeks, setRepeatWeeks] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)

  // Pattern mode: per-day settings (just enabled/disabled)
  const [pattern, setPattern] = useState<PatternDay[]>(
    DAY_NAMES.map(() => ({ enabled: false }))
  )

  // Quick mode: select days only
  const [selectedDays, setSelectedDays] = useState<boolean[]>(
    Array(7).fill(false)
  )

  useEffect(() => {
    fetch('/api/presets')
      .then((r) => r.json())
      .then((data) => setPresets(Array.isArray(data) ? data : []))
      .catch(() => setPresets([]))
  }, [])

  function updatePattern(idx: number, updates: Partial<PatternDay>) {
    setPattern((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...updates } : p))
    )
  }

  function getPreviewEntries() {
    const entries: { date: Date }[] = []
    for (let w = 0; w < repeatWeeks; w++) {
      const offset = w * 7
      if (mode === 'pattern') {
        pattern.forEach((day, i) => {
          if (!day.enabled) return
          entries.push({
            date: addDays(weekStart, offset + i),
          })
        })
      } else {
        selectedDays.forEach((sel, i) => {
          if (!sel) return
          entries.push({
            date: addDays(weekStart, offset + i),
          })
        })
      }
    }
    return entries
  }

  async function handleSubmit() {
    const entries = getPreviewEntries()
    if (!presetId || entries.length === 0) return

    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return

    setSaving(true)
    setError(null)
    setProgress({ done: 0, total: entries.length })

    const created: Schedule[] = []

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const d = entry.date
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset_id: preset.id,
          move_name: preset.override_move_name || preset.front_page_title || preset.name,
          difficulty: preset.default_difficulty || null,
          starts_at: new Date(`${dateStr}T${startTime}:00`).toISOString(),
          ends_at: new Date(`${dateStr}T${endTime}:00`).toISOString(),
          label: null,
        }),
      })

      setProgress({ done: i + 1, total: entries.length })

      if (!res.ok) {
        const data = await res.json()
        setError(`Failed on ${formatDate(entry.date)}: ${data.error}`)
        setSaving(false)
        setProgress(null)
        if (created.length > 0) onCreated(created)
        return
      }
      created.push(await res.json())
    }

    setSaving(false)
    setProgress(null)
    onCreated(created)
  }

  const preview = getPreviewEntries()
  const canSubmit = presetId && preview.length > 0 && !saving
  const selectedPreset = presets.find((p) => p.id === presetId)

  const difficultyLabel = (d: Difficulty | null) => {
    if (!d) return 'Preset default'
    return d.charAt(0).toUpperCase() + d.slice(1)
  }

  const difficultyClasses = (d: Difficulty | null) => {
    if (!d) return 'bg-zinc-700/50 text-gray-400'
    if (d === 'beginner') return 'bg-emerald-500/20 text-emerald-300'
    if (d === 'intermediate') return 'bg-amber-500/20 text-amber-300'
    return 'bg-red-500/20 text-red-300'
  }

  return (
    <div className="space-y-5">
      {/* Mode Toggle */}
      <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('pattern')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'pattern'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Weekly Pattern
        </button>
        <button
          onClick={() => setMode('quick')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'quick'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Quick Fill
        </button>
      </div>

      {/* Preset + Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-400 text-xs mb-1">Preset</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">-- Select a preset --</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {presets.length === 0 && (
            <p className="text-yellow-600 text-xs mt-1">
              Create presets in Settings first.
            </p>
          )}
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">End time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Selected Preset Info */}
      {selectedPreset && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-xs space-y-1.5">
          {selectedPreset.front_page_title && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Title:</span>
              <span className="text-white">{selectedPreset.front_page_title}</span>
            </div>
          )}
          {selectedPreset.default_difficulty && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Difficulty:</span>
              <span className={`font-semibold ${
                selectedPreset.default_difficulty === 'beginner' ? 'text-green-300'
                  : selectedPreset.default_difficulty === 'intermediate' ? 'text-orange-300'
                  : 'text-red-300'
              }`}>{DIFFICULTY_LABELS[selectedPreset.default_difficulty]}</span>
            </div>
          )}
          {selectedPreset.move_description && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">Desc:</span>
              <span className="text-gray-300 line-clamp-1">{selectedPreset.move_description}</span>
            </div>
          )}
        </div>
      )}

      {/* Pattern Mode */}
      {mode === 'pattern' && (
        <div>
          <label className="block text-gray-400 text-xs mb-2">
            Weekly Pattern
          </label>
          <p className="text-gray-600 text-[11px] mb-3">
            Set a difficulty for each day. The pattern repeats for the number of
            weeks you choose.
          </p>
          <div className="space-y-1">
            {pattern.map((day, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                  day.enabled
                    ? 'bg-zinc-800/80 border-zinc-700'
                    : 'bg-zinc-900/50 border-zinc-800/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => updatePattern(i, { enabled: !day.enabled })}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    day.enabled
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-zinc-600 hover:border-zinc-400'
                  }`}
                >
                  {day.enabled && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-sm w-28 ${day.enabled ? 'text-white' : 'text-gray-600'}`}
                >
                  {DAY_NAMES[i]}
                  <span className="text-[10px] text-gray-500 ml-1.5">
                    {formatDate(addDays(weekStart, i))}
                  </span>
                </span>
                {day.enabled && (
                  <span className="text-xs text-gray-500 ml-auto">
                    Uses preset difficulty
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <label className="text-gray-400 text-xs">Repeat for</label>
            <input
              type="number"
              min={1}
              max={12}
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(parseInt(e.target.value) || 1)}
              className="w-16 bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-orange-500"
            />
            <span className="text-gray-400 text-xs">
              week{repeatWeeks > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Quick Mode */}
      {mode === 'quick' && (
        <div>
          <label className="block text-gray-400 text-xs mb-2">
            Select days
          </label>
          <div className="flex gap-1">
            {selectedDays.map((selected, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setSelectedDays((prev) =>
                    prev.map((v, j) => (j === i ? !v : v))
                  )
                }
                className={`flex-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                    : 'bg-zinc-900 border-zinc-800 text-gray-500 hover:border-zinc-600'
                }`}
              >
                <div>{DAY_SHORT[i]}</div>
                <div className="text-[10px] mt-0.5 opacity-60">
                  {addDays(weekStart, i).getDate()}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setSelectedDays(Array(7).fill(true))}
              className="text-[11px] text-orange-400 hover:text-orange-300"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays(Array(7).fill(false))}
              className="text-[11px] text-gray-500 hover:text-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <label className="block text-gray-400 text-xs mb-2">
            Preview ({preview.length} schedule
            {preview.length > 1 ? 's' : ''})
          </label>
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-3 max-h-52 overflow-y-auto space-y-1.5">
            {preview.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-28 shrink-0">
                  {entry.date.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-orange-400 font-medium uppercase">
                  {selectedPreset?.override_move_name || selectedPreset?.front_page_title || selectedPreset?.name || 'Unknown'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${difficultyClasses(selectedPreset?.default_difficulty || null)}`}
                >
                  {difficultyLabel(selectedPreset?.default_difficulty || null)}
                </span>
                <span className="text-gray-600">
                  {startTime} - {endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Creating schedules... {progress.done}/{progress.total}
            </span>
            <span>
              {Math.round((progress.done / progress.total) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.done / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-gray-400 border border-zinc-700 hover:border-zinc-500 rounded-lg py-2.5 text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || presets.length === 0}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          {saving
            ? 'Creating...'
            : `Create ${preview.length} Schedule${preview.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
