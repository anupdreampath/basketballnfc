'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Schedule } from '@/types'
import ScheduleForm from '@/components/admin/ScheduleForm'
import ScheduleList from '@/components/admin/ScheduleList'

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/schedules')
    setSchedules(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  const now = new Date()
  const activeSchedule = schedules.find(
    (s) => new Date(s.starts_at) <= now && new Date(s.ends_at) >= now && s.is_active
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">Schedule which basketball move plays and when. Users pick their difficulty at runtime.</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div />
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add schedule
          </button>
        )}
      </div>

      {/* Status banner */}
      <div className={`rounded-xl p-4 mb-6 border ${activeSchedule ? 'bg-green-950/30 border-green-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeSchedule ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-sm text-gray-400">
            {activeSchedule ? (
              <>Now showing move: <span className="text-orange-400 font-bold uppercase">{activeSchedule.move_name}</span></>
            ) : (
              'No scheduled move active — showing fallback (latest uploaded move).'
            )}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-6">
          <h3 className="text-white font-semibold mb-4">New schedule</h3>
          <ScheduleForm
            onSave={(s) => { setSchedules(prev => [...prev, s].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : (
        <ScheduleList
          schedules={schedules}
          onUpdate={(u) => setSchedules(prev => prev.map(s => s.id === u.id ? u : s))}
          onDelete={(id) => setSchedules(prev => prev.filter(s => s.id !== id))}
        />
      )}
    </div>
  )
}
