'use client'

import { useState, useEffect } from 'react'
import type { Preset, Difficulty, DeviceType, Video, Settings } from '@/types'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '@/types'

const DEVICES: DeviceType[] = ['mobile', 'tablet', 'desktop']
const DEVICE_LABELS: Record<DeviceType, string> = { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }

type SlotKey =
  | 'slot_beginner_mobile_id' | 'slot_beginner_tablet_id' | 'slot_beginner_desktop_id'
  | 'slot_intermediate_mobile_id' | 'slot_intermediate_tablet_id' | 'slot_intermediate_desktop_id'
  | 'slot_pro_mobile_id' | 'slot_pro_tablet_id' | 'slot_pro_desktop_id'

function slotKey(d: Difficulty, device: DeviceType): SlotKey {
  return `slot_${d}_${device}_id` as SlotKey
}

const EMPTY_FORM = {
  name: '',
  override_move_name: '',
  default_difficulty: '' as Difficulty | '',
  front_page_title: '',
  move_description: '',
  move_level: '',
  move_quote: '',
  slot_beginner_mobile_id: '',
  slot_beginner_tablet_id: '',
  slot_beginner_desktop_id: '',
  slot_intermediate_mobile_id: '',
  slot_intermediate_tablet_id: '',
  slot_intermediate_desktop_id: '',
  slot_pro_mobile_id: '',
  slot_pro_tablet_id: '',
  slot_pro_desktop_id: '',
}

export default function PresetManager() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Preset | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })

  useEffect(() => {
    loadPresets()
    loadVideos()
  }, [])

  async function loadPresets() {
    try {
      const res = await fetch('/api/presets')
      const data = await res.json()
      setPresets(Array.isArray(data) ? data : [])
    } catch { setPresets([]) }
  }

  async function loadVideos() {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(Array.isArray(data) ? data : [])
    } catch { setVideos([]) }
  }

  function handleEdit(preset: Preset) {
    setEditing(preset)
    setFormData({
      name: preset.name,
      override_move_name: preset.override_move_name || '',
      default_difficulty: preset.default_difficulty || '',
      front_page_title: preset.front_page_title || '',
      move_description: preset.move_description || '',
      move_level: preset.move_level || '',
      move_quote: preset.move_quote || '',
      slot_beginner_mobile_id: preset.slot_beginner_mobile_id || '',
      slot_beginner_tablet_id: preset.slot_beginner_tablet_id || '',
      slot_beginner_desktop_id: preset.slot_beginner_desktop_id || '',
      slot_intermediate_mobile_id: preset.slot_intermediate_mobile_id || '',
      slot_intermediate_tablet_id: preset.slot_intermediate_tablet_id || '',
      slot_intermediate_desktop_id: preset.slot_intermediate_desktop_id || '',
      slot_pro_mobile_id: preset.slot_pro_mobile_id || '',
      slot_pro_tablet_id: preset.slot_pro_tablet_id || '',
      slot_pro_desktop_id: preset.slot_pro_desktop_id || '',
    })
    setShowForm(true)
  }

  function handleNew() {
    setEditing(null)
    setFormData({ ...EMPTY_FORM })
    setShowForm(true)
  }

  async function handleCreateFromSettings() {
    setEditing(null)
    try {
      const [sRes, vRes] = await Promise.all([fetch('/api/settings'), fetch('/api/videos')])
      const settings: Settings = await sRes.json()
      setFormData({
        name: 'Default',
        override_move_name: settings.override_move_name || '',
        default_difficulty: settings.default_difficulty || '',
        front_page_title: settings.front_page_title || '',
        move_description: settings.move_description || '',
        move_level: settings.move_level || '',
        move_quote: settings.move_quote || '',
        slot_beginner_mobile_id: settings.slot_beginner_mobile_id || '',
        slot_beginner_tablet_id: settings.slot_beginner_tablet_id || '',
        slot_beginner_desktop_id: settings.slot_beginner_desktop_id || '',
        slot_intermediate_mobile_id: settings.slot_intermediate_mobile_id || '',
        slot_intermediate_tablet_id: settings.slot_intermediate_tablet_id || '',
        slot_intermediate_desktop_id: settings.slot_intermediate_desktop_id || '',
        slot_pro_mobile_id: settings.slot_pro_mobile_id || '',
        slot_pro_tablet_id: settings.slot_pro_tablet_id || '',
        slot_pro_desktop_id: settings.slot_pro_desktop_id || '',
      })
      setShowForm(true)
    } catch {
      setError('Failed to load current settings')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name) { setError('Preset name is required'); return }

    setLoading(true)
    setError(null)

    const payload: Record<string, any> = { ...formData }
    // Convert empty strings to null for DB
    for (const key of Object.keys(payload)) {
      if (key !== 'name' && payload[key] === '') payload[key] = null
    }

    try {
      const url = editing ? `/api/presets/${editing.id}` : '/api/presets'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      setShowForm(false)
      await loadPresets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this preset?')) return
    try {
      await fetch(`/api/presets/${id}`, { method: 'DELETE' })
      await loadPresets()
    } catch { setError('Failed to delete') }
  }

  const set = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-semibold">Move Presets</h3>
          <p className="text-gray-500 text-xs mt-0.5">Each preset is a complete settings snapshot for scheduling.</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            {presets.length === 0 && (
              <button onClick={handleCreateFromSettings}
                className="text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500 rounded-lg px-3 py-2 text-xs transition-colors">
                Create from current settings
              </button>
            )}
            <button onClick={handleNew}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-2 text-sm">
              + New Preset
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-950/50 p-4 rounded-lg border border-zinc-700 max-h-[75vh] overflow-y-auto">
          {/* Preset Name */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Preset Name *</label>
            <input type="text" value={formData.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Cross Over, Default"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
          </div>

          {/* Front Page Title — mirrors settings */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Front Page Title</label>
            <p className="text-gray-600 text-[11px] mb-1">The big text users see on the hero screen.</p>
            <input type="text" value={formData.front_page_title} onChange={e => set('front_page_title', e.target.value)}
              placeholder="e.g. Cross Over, Smash, Behind the Back…"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
          </div>

          {/* Move Description */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Move Description</label>
            <p className="text-gray-600 text-[11px] mb-1">1–2 sentences describing the move.</p>
            <textarea value={formData.move_description} onChange={e => set('move_description', e.target.value)}
              placeholder="e.g. A quick shift to create space and beat your defender."
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none min-h-16" />
          </div>

          {/* Move Level */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Move Level</label>
            <p className="text-gray-600 text-[11px] mb-1">E.g. "LEVEL: PRO" or any custom text.</p>
            <input type="text" value={formData.move_level} onChange={e => set('move_level', e.target.value)}
              placeholder="e.g. LEVEL: PRO"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
          </div>

          {/* Inspirational Quote */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Inspirational Quote</label>
            <p className="text-gray-600 text-[11px] mb-1">A motivational quote displayed below the level.</p>
            <textarea value={formData.move_quote} onChange={e => set('move_quote', e.target.value)}
              placeholder="e.g. Separation is created, not given."
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none min-h-16" />
          </div>

          {/* Default Difficulty */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Default Difficulty</label>
            <p className="text-gray-600 text-[11px] mb-2">Choose which difficulty video everyone sees when they tap Watch Video.</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map(diff => {
                const isActive = formData.default_difficulty === diff
                return (
                  <button key={diff} type="button"
                    onClick={() => set('default_difficulty', diff)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all border ${
                      isActive
                        ? diff === 'beginner' ? 'bg-green-500/20 border-green-500 text-green-300'
                          : diff === 'intermediate' ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-zinc-800 border-zinc-700 text-gray-500 hover:border-zinc-600'
                    }`}>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        isActive
                          ? diff === 'beginner' ? 'border-green-400' : diff === 'intermediate' ? 'border-orange-400' : 'border-red-400'
                          : 'border-zinc-600'
                      }`}>
                        {isActive && (
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            diff === 'beginner' ? 'bg-green-400' : diff === 'intermediate' ? 'bg-orange-400' : 'bg-red-400'
                          }`} />
                        )}
                      </div>
                      {DIFFICULTY_LABELS[diff]}
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-gray-600 text-xs mt-2">Only one can be active. This determines which video plays for all users.</p>
          </div>

          {/* Video Assignments */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Video Assignments</label>
            <p className="text-gray-600 text-[11px] mb-2">Choose exactly which video plays for each difficulty and device.</p>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr>
                    <th className="text-left text-gray-600 font-medium pb-2 pr-3 w-28">Difficulty</th>
                    {DEVICES.map(device => (
                      <th key={device} className="text-left text-gray-600 font-medium pb-2 px-1">{DEVICE_LABELS[device]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {DIFFICULTIES.map(diff => (
                    <tr key={diff}>
                      <td className="py-2 pr-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          diff === 'beginner' ? 'bg-green-500/20 text-green-300'
                          : diff === 'intermediate' ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-red-500/20 text-red-300'
                        }`}>{DIFFICULTY_LABELS[diff]}</span>
                      </td>
                      {DEVICES.map(device => {
                        const key = slotKey(diff, device)
                        return (
                          <td key={device} className="py-2 px-1">
                            <select value={formData[key] ?? ''}
                              onChange={e => set(key, e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 min-w-[100px]">
                              <option value="">— None —</option>
                              {videos.map(v => (
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
            <p className="text-gray-600 text-xs mt-2">Slots override move-based video resolution. Leave as "None" to use automatic fallback.</p>
          </div>

          {/* Manual Override Move */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Manual Override Move</label>
            <p className="text-gray-600 text-[11px] mb-1">This move name is used for automatic video resolution when no slots are set.</p>
            <input type="text" value={formData.override_move_name} onChange={e => set('override_move_name', e.target.value)}
              placeholder="Enter move name (e.g. IMG 4830)"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-zinc-950/80 backdrop-blur py-3 -mx-4 px-4 border-t border-zinc-800">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 text-gray-400 border border-zinc-700 hover:border-zinc-500 rounded-lg py-2.5 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
              {loading ? 'Saving...' : editing ? 'Update Preset' : 'Create Preset'}
            </button>
          </div>
        </form>
      )}

      {/* Preset list */}
      <div className="space-y-2">
        {presets.length === 0 && !showForm ? (
          <p className="text-gray-500 text-sm text-center py-4">No presets yet. Create one from current settings to get started.</p>
        ) : (
          presets.map(preset => (
            <div key={preset.id} className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{preset.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {preset.front_page_title && <p className="text-gray-400 text-xs">"{preset.front_page_title}"</p>}
                  {preset.default_difficulty && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      preset.default_difficulty === 'beginner' ? 'bg-green-500/20 text-green-300'
                      : preset.default_difficulty === 'intermediate' ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-red-500/20 text-red-300'
                    }`}>{DIFFICULTY_LABELS[preset.default_difficulty]}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button onClick={() => handleEdit(preset)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                <button onClick={() => handleDelete(preset.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
