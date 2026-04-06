'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Schedule, Difficulty } from '@/types'
import ScheduleForm from '@/components/admin/ScheduleForm'
import ScheduleCalendar from '@/components/admin/ScheduleCalendar'
import BulkScheduleForm from '@/components/admin/BulkScheduleForm'

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date)
  r.setDate(r.getDate() + days)
  return r
}

function formatWeekRange(start: Date): string {
  const end = addDays(start, 6)
  const startStr = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  const endStr = end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startStr} – ${endStr}`
}

function getListStatus(
  starts: string,
  ends: string
): { label: string; classes: string } {
  const now = Date.now()
  const s = new Date(starts).getTime()
  const e = new Date(ends).getTime()
  if (now < s)
    return { label: 'Upcoming', classes: 'bg-blue-500/20 text-blue-300' }
  if (now >= s && now <= e)
    return { label: 'Live now', classes: 'bg-green-500/20 text-green-300' }
  return { label: 'Past', classes: 'bg-zinc-700/50 text-gray-500' }
}

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-300',
  intermediate: 'bg-amber-500/20 text-amber-300',
  pro: 'bg-red-500/20 text-red-300',
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [formDate, setFormDate] = useState<Date | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/schedules')
    setSchedules(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const now = new Date()
  const activeSchedule = schedules.find(
    (s) =>
      new Date(s.starts_at) <= now &&
      new Date(s.ends_at) >= now &&
      s.is_active
  )

  // Week-filtered schedules for list view
  const weekEnd = addDays(weekStart, 7)
  const weekSchedules = schedules
    .filter((s) => {
      const start = new Date(s.starts_at)
      return start >= weekStart && start < weekEnd
    })
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    )

  // Stats
  const upcomingCount = schedules.filter(
    (s) => new Date(s.starts_at) > now
  ).length
  const thisWeekCount = weekSchedules.length

  // Navigation
  const prevWeek = () => setWeekStart((prev) => addDays(prev, -7))
  const nextWeek = () => setWeekStart((prev) => addDays(prev, 7))
  const goToToday = () => setWeekStart(getMonday(new Date()))

  // CRUD
  function handleAddToDay(date: Date) {
    setEditing(null)
    setFormDate(date)
    setShowBulk(false)
    setShowForm(true)
  }

  function handleEdit(schedule: Schedule) {
    setShowForm(true)
    setShowBulk(false)
    setFormDate(null)
    setEditing(schedule)
  }

  function handleSave(saved: Schedule) {
    if (editing) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === saved.id ? saved : s))
      )
    } else {
      setSchedules((prev) =>
        [...prev, saved].sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        )
      )
    }
    setShowForm(false)
    setEditing(null)
    setFormDate(null)
  }

  function handleBulkCreated(created: Schedule[]) {
    setSchedules((prev) =>
      [...prev, ...created].sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      )
    )
    setShowBulk(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
    if (editing?.id === id) {
      setEditing(null)
      setShowForm(false)
    }
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setFormDate(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-white text-xl sm:text-2xl font-bold">Schedule Planner</h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setShowBulk(true); setShowForm(false); setEditing(null) }}
              className="hidden sm:flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-medium rounded-lg px-3 py-2 text-sm transition-colors border border-zinc-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Bulk
            </button>
            <button
              onClick={() => { setShowForm(true); setShowBulk(false); setEditing(null); setFormDate(null) }}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1 hidden sm:block">
          Plan your video content for weeks or months ahead. Set which move and difficulty plays each day.
        </p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-3 sm:p-4 mb-4 border ${activeSchedule ? 'bg-green-950/30 border-green-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${activeSchedule ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-xs sm:text-sm text-gray-400 truncate">
              {activeSchedule ? (
                <>
                  Now:{' '}
                  <span className="text-orange-400 font-bold uppercase">{activeSchedule.move_name}</span>
                  {activeSchedule.difficulty && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_BADGE[activeSchedule.difficulty]}`}>
                      {activeSchedule.difficulty}
                    </span>
                  )}
                </>
              ) : (
                'No scheduled move active — showing fallback.'
              )}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 shrink-0">
            <span>{thisWeekCount} this week</span>
            <span>{upcomingCount} upcoming</span>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-white text-xs sm:text-sm font-semibold text-center whitespace-nowrap">{formatWeekRange(weekStart)}</h2>
          <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={goToToday} className="text-xs text-orange-400 hover:text-orange-300 transition-colors shrink-0">Today</button>
        </div>

        <div className="flex gap-0.5 bg-zinc-800 rounded-lg p-0.5 shrink-0">
          <button onClick={() => setView('calendar')}
            className={`px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${view === 'calendar' ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h16" /></svg>
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button onClick={() => setView('list')}
            className={`px-2 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${view === 'list' ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-40 bg-zinc-900 rounded-lg animate-pulse"
              />
            ))}
        </div>
      ) : view === 'calendar' ? (
        <ScheduleCalendar
          weekDays={weekDays}
          schedules={schedules}
          onAddToDay={handleAddToDay}
          onEditSchedule={handleEdit}
        />
      ) : (
        /* List View */
        <div className="space-y-1">
          {weekSchedules.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-8">
              No schedules this week. Click &ldquo;Add&rdquo; or &ldquo;Bulk
              Schedule&rdquo; to plan your content.
            </p>
          ) : (
            weekSchedules.map((schedule) => {
              const status = getListStatus(
                schedule.starts_at,
                schedule.ends_at
              )
              return (
                <div
                  key={schedule.id}
                  className={`bg-zinc-900 rounded-xl p-4 border flex items-start justify-between gap-4 ${
                    status.label === 'Live now'
                      ? 'border-green-500/30'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.classes}`}
                      >
                        {status.label}
                      </span>
                      {schedule.move_name && (
                        <span className="text-orange-400 text-sm font-bold uppercase tracking-wide">
                          {schedule.move_name}
                        </span>
                      )}
                      {schedule.difficulty && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            DIFFICULTY_BADGE[schedule.difficulty]
                          }`}
                        >
                          {schedule.difficulty}
                        </span>
                      )}
                      {schedule.label && (
                        <span className="text-gray-400 text-sm">
                          {schedule.label}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(schedule.starts_at))}
                      {' → '}
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(schedule.ends_at))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="text-gray-500 hover:text-white text-xs border border-zinc-700 hover:border-zinc-500 rounded-md px-2 py-1 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deletingId === schedule.id}
                      className="text-red-500 hover:text-red-400 text-xs border border-zinc-800 hover:border-red-800 rounded-md px-2 py-1 transition-colors disabled:opacity-50"
                    >
                      {deletingId === schedule.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showForm || editing) && !showBulk && (
        <div className="mt-4 bg-zinc-900 rounded-xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {editing ? 'Edit Schedule' : 'New Schedule'}
            </h3>
            {editing && (
              <button
                onClick={() => handleDelete(editing.id)}
                disabled={deletingId === editing.id}
                className="text-red-500 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
              >
                {deletingId === editing.id
                  ? 'Deleting...'
                  : 'Delete this schedule'}
              </button>
            )}
          </div>
          <ScheduleForm
            existing={editing ?? undefined}
            prefillDate={formDate ?? undefined}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Bulk Schedule Form */}
      {showBulk && (
        <div className="mt-4 bg-zinc-900 rounded-xl p-5 border border-orange-500/30">
          <h3 className="text-white font-semibold mb-1">Bulk Schedule</h3>
          <p className="text-gray-500 text-xs mb-4">
            Plan an entire week or month at once. Choose a pattern and repeat
            it.
          </p>
          <BulkScheduleForm
            weekStart={weekStart}
            onCreated={handleBulkCreated}
            onCancel={() => setShowBulk(false)}
          />
        </div>
      )}
    </div>
  )
}
