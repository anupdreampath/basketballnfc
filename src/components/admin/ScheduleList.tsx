'use client'

import { useState } from 'react'
import type { Schedule } from '@/types'
import ScheduleForm from './ScheduleForm'

interface Props {
  schedules: Schedule[]
  onUpdate: (schedule: Schedule) => void
  onDelete: (id: string) => void
}

function formatDateRange(starts: string, ends: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  return `${fmt(starts)} → ${fmt(ends)}`
}

function getStatus(starts: string, ends: string): { label: string; classes: string } {
  const now = Date.now()
  const s = new Date(starts).getTime()
  const e = new Date(ends).getTime()
  if (now < s) return { label: 'Upcoming', classes: 'bg-blue-500/20 text-blue-300' }
  if (now >= s && now <= e) return { label: 'Live now', classes: 'bg-green-500/20 text-green-300' }
  return { label: 'Past', classes: 'bg-zinc-700/50 text-gray-500' }
}

export default function ScheduleList({ schedules, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
    onDelete(id)
    setDeletingId(null)
  }

  if (schedules.length === 0) {
    return <p className="text-center text-gray-600 text-sm py-8">No schedules yet.</p>
  }

  return (
    <div className="space-y-2">
      {schedules.map((schedule) => {
        const status = getStatus(schedule.starts_at, schedule.ends_at)
        if (editing?.id === schedule.id) {
          return (
            <div key={schedule.id} className="bg-zinc-900 rounded-xl p-4 border border-orange-500/50">
              <p className="text-white text-sm font-medium mb-4">Edit schedule</p>
              <ScheduleForm existing={editing} onSave={(u) => { onUpdate(u); setEditing(null) }} onCancel={() => setEditing(null)} />
            </div>
          )
        }
        return (
          <div key={schedule.id} className={`bg-zinc-900 rounded-xl p-4 border flex items-start justify-between gap-4 ${status.label === 'Live now' ? 'border-green-500/30' : 'border-zinc-800'}`}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.classes}`}>{status.label}</span>
                {schedule.move_name && <span className="text-orange-400 text-sm font-bold uppercase tracking-wide">{schedule.move_name}</span>}
                {schedule.label && <span className="text-gray-400 text-sm">{schedule.label}</span>}
              </div>
              <p className="text-gray-600 text-xs">{formatDateRange(schedule.starts_at, schedule.ends_at)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setEditing(schedule)} className="text-gray-500 hover:text-white text-xs border border-zinc-700 hover:border-zinc-500 rounded-md px-2 py-1 transition-colors">Edit</button>
              <button onClick={() => handleDelete(schedule.id)} disabled={deletingId === schedule.id} className="text-red-500 hover:text-red-400 text-xs border border-zinc-800 hover:border-red-800 rounded-md px-2 py-1 transition-colors disabled:opacity-50">
                {deletingId === schedule.id ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
