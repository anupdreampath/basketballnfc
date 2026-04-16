'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Settings, Video, Difficulty, DeviceType } from '@/types'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '@/types'
import PresetManager from '@/components/admin/PresetManager'

const DEVICES: DeviceType[] = ['mobile', 'tablet', 'desktop']
const DEVICE_LABELS: Record<DeviceType, string> = { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }

type SlotKey =
  | 'slot_beginner_mobile_id' | 'slot_beginner_tablet_id' | 'slot_beginner_desktop_id'
  | 'slot_intermediate_mobile_id' | 'slot_intermediate_tablet_id' | 'slot_intermediate_desktop_id'
  | 'slot_pro_mobile_id' | 'slot_pro_tablet_id' | 'slot_pro_desktop_id'

function slotKey(d: Difficulty, device: DeviceType): SlotKey {
  return `slot_${d}_${device}_id` as SlotKey
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [levelDraft, setLevelDraft] = useState('')
  const [quoteDraft, setQuoteDraft] = useState('')

  const fetchAll = useCallback(async () => {
    const [s, v] = await Promise.all([fetch('/api/settings'), fetch('/api/videos')])
    const sData: Settings = await s.json()
    const vData: Video[] = await v.json()
    setSettings(sData)
    setTitleDraft(sData.front_page_title ?? '')
    setDescriptionDraft(sData.move_description ?? '')
    setLevelDraft(sData.move_level ?? '')
    setQuoteDraft(sData.move_quote ?? '')
    setVideos(Array.isArray(vData) ? vData : [])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function save(patch: Partial<Settings>) {
    setSaving(true); setSaved(false)
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const updated: Settings = await res.json()
    setSettings(updated)
    setTitleDraft(updated.front_page_title ?? '')
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
  }

  const savingIndicator = (
    <span className="text-xs">
      {saving && <span className="text-gray-500">Saving…</span>}
      {saved && !saving && <span className="text-green-400">Saved</span>}
    </span>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure what plays on the front page.</p>
      </div>

      {/* ── Section 1: Front Page Title ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Front Page Title</p>
            <p className="text-gray-500 text-sm mt-0.5">The big text users see on the hero screen.</p>
          </div>
          {savingIndicator}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              if (titleDraft !== (settings.front_page_title ?? '')) {
                save({ front_page_title: titleDraft.trim() || null })
              }
            }}
            placeholder="e.g. Cross Over, Smash, Behind the Back…"
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600"
          />
          <button
            onClick={() => save({ front_page_title: titleDraft.trim() || null })}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Save
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2">Leave blank to use the move name from the video library.</p>
      </div>

      {/* ── Section 1b: Move Description ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Move Description</p>
            <p className="text-gray-500 text-sm mt-0.5">1–2 sentences describing the move.</p>
          </div>
          {savingIndicator}
        </div>
        <div className="flex gap-2">
          <textarea
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={() => {
              if (descriptionDraft !== (settings.move_description ?? '')) {
                save({ move_description: descriptionDraft.trim() || null })
              }
            }}
            placeholder="e.g. A quick shift to create space and beat your defender."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600 min-h-20 resize-none"
          />
          <button
            onClick={() => save({ move_description: descriptionDraft.trim() || null })}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium h-fit"
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Section 1c: Move Level ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Move Level</p>
            <p className="text-gray-500 text-sm mt-0.5">E.g. "LEVEL: PRO" or any custom text.</p>
          </div>
          {savingIndicator}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={levelDraft}
            onChange={(e) => setLevelDraft(e.target.value)}
            onBlur={() => {
              if (levelDraft !== (settings.move_level ?? '')) {
                save({ move_level: levelDraft.trim() || null })
              }
            }}
            placeholder="e.g. LEVEL: PRO"
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600"
          />
          <button
            onClick={() => save({ move_level: levelDraft.trim() || null })}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Section 1d: Inspirational Quote ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Inspirational Quote</p>
            <p className="text-gray-500 text-sm mt-0.5">A motivational quote displayed below the level.</p>
          </div>
          {savingIndicator}
        </div>
        <div className="flex gap-2">
          <textarea
            value={quoteDraft}
            onChange={(e) => setQuoteDraft(e.target.value)}
            onBlur={() => {
              if (quoteDraft !== (settings.move_quote ?? '')) {
                save({ move_quote: quoteDraft.trim() || null })
              }
            }}
            placeholder="e.g. Separation is created, not given."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600 min-h-20 resize-none"
          />
          <button
            onClick={() => save({ move_quote: quoteDraft.trim() || null })}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium h-fit"
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Section 1e: Default Difficulty (shown to all users) ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Default Difficulty</p>
            <p className="text-gray-500 text-sm mt-0.5">Choose which difficulty video everyone sees when they tap Watch Video.</p>
          </div>
          {savingIndicator}
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((diff) => {
            const isActive = (settings.default_difficulty ?? 'pro') === diff
            return (
              <button
                key={diff}
                onClick={() => save({ default_difficulty: diff } as any)}
                disabled={saving}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all border ${
                  isActive
                    ? diff === 'beginner'
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : diff === 'intermediate'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-zinc-800 border-zinc-700 text-gray-500 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    isActive
                      ? diff === 'beginner'
                        ? 'border-green-400'
                        : diff === 'intermediate'
                        ? 'border-orange-400'
                        : 'border-red-400'
                      : 'border-zinc-600'
                  }`}>
                    {isActive && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        diff === 'beginner' ? 'bg-green-400'
                        : diff === 'intermediate' ? 'bg-orange-400'
                        : 'bg-red-400'
                      }`} />
                    )}
                  </div>
                  {DIFFICULTY_LABELS[diff]}
                </div>
              </button>
            )
          })}
        </div>
        <p className="text-gray-600 text-xs mt-3">Only one can be active. This determines which video plays for all users and shows as a splash intro.</p>
      </div>

      {/* ── Section 2: Video Slot Assignment ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white font-medium">Video Assignments</p>
            <p className="text-gray-500 text-sm mt-0.5">Choose exactly which video plays for each difficulty and device.</p>
          </div>
          {savingIndicator}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-gray-600 font-medium pb-2 pr-3 w-28">Difficulty</th>
                {DEVICES.map((device) => (
                  <th key={device} className="text-left text-gray-600 font-medium pb-2 px-2">{DEVICE_LABELS[device]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {DIFFICULTIES.map((diff) => (
                <tr key={diff}>
                  <td className="py-3 pr-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      diff === 'beginner' ? 'bg-green-500/20 text-green-300'
                      : diff === 'intermediate' ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-red-500/20 text-red-300'
                    }`}>{DIFFICULTY_LABELS[diff]}</span>
                  </td>
                  {DEVICES.map((device) => {
                    const key = slotKey(diff, device)
                    const currentId = settings[key] ?? ''
                    return (
                      <td key={device} className="py-3 px-2">
                        <select
                          value={currentId}
                          onChange={(e) => save({ [key]: e.target.value || null })}
                          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 min-w-[140px]"
                        >
                          <option value="">— None —</option>
                          {videos.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.move_name} · {DIFFICULTY_LABELS[v.difficulty]} · {v.device_type}
                            </option>
                          ))}
                        </select>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 text-xs mt-3">
          Slots override move-based video resolution. Leave as "None" to use the automatic fallback.
        </p>
      </div>

      {/* ── Section 3: Scheduler ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Scheduler</p>
            <p className="text-gray-500 text-sm mt-0.5">
              {settings.scheduler_enabled
                ? 'Active — plays the scheduled move. Slot assignments still apply.'
                : 'Off — plays the manually selected move below (or slot assignments above).'}
            </p>
          </div>
          <button
            onClick={() => save({ scheduler_enabled: !settings.scheduler_enabled })}
            disabled={saving}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.scheduler_enabled ? 'bg-orange-500' : 'bg-zinc-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.scheduler_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* ── Section 3b: Move Presets ── */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-4">
        <PresetManager onApply={fetchAll} currentSettings={settings} />
      </div>

      {/* ── Section 4: Manual Override Move ── */}
      <div className={`bg-zinc-900 rounded-xl p-5 border mb-4 transition-colors ${!settings.scheduler_enabled ? 'border-orange-500/40' : 'border-zinc-800'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Manual Override Move</p>
            <p className="text-gray-500 text-sm mt-0.5">
              {settings.scheduler_enabled ? 'Saved but inactive while scheduler is on.' : 'This move name is used for automatic video resolution when no slots are set.'}
            </p>
          </div>
        </div>
        <input
          type="text"
          value={settings.override_move_name ?? ''}
          onChange={(e) => save({ override_move_name: e.target.value || null })}
          placeholder="Enter move name (e.g. IMG 4830)"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600"
        />
      </div>

      {/* ── Priority info ── */}
      <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
        <h3 className="text-white text-sm font-medium mb-2">How it works</h3>
        <ol className="space-y-1 text-gray-500 text-sm list-decimal list-inside">
          <li>Slot assigned for difficulty + device → <span className="text-white">that video plays</span></li>
          <li>Scheduler off + override move set → <span className="text-white">override move plays</span></li>
          <li>Scheduler on + active schedule → <span className="text-white">scheduled move plays</span></li>
          <li>No schedule active → <span className="text-white">most recently uploaded move plays</span></li>
        </ol>
        <p className="text-gray-600 text-xs mt-3">Front Page Title overrides the displayed name in all cases.</p>
      </div>
    </div>
  )
}
