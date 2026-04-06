'use client'

import type { Schedule, Difficulty } from '@/types'

interface Props {
  weekDays: Date[]
  schedules: Schedule[]
  onAddToDay: (date: Date) => void
  onEditSchedule: (schedule: Schedule) => void
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  intermediate: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  pro: 'bg-red-500/20 border-red-500/40 text-red-300',
}

const DIFFICULTY_DOT: Record<string, string> = {
  beginner: 'bg-emerald-400',
  intermediate: 'bg-amber-400',
  pro: 'bg-red-400',
}

function isSameDate(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function isToday(date: Date): boolean {
  return isSameDate(date, new Date())
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function getSchedulesForDate(schedules: Schedule[], date: Date): Schedule[] {
  return schedules
    .filter(s => isSameDate(new Date(s.starts_at), date))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ScheduleCalendar({ weekDays, schedules, onAddToDay, onEditSchedule }: Props) {
  return (
    <>
      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => {
          const today = isToday(day)
          return (
            <div key={`hdr-${i}`} className={`text-center py-2 rounded-t-lg ${today ? 'bg-orange-500/10' : ''}`}>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{DAY_NAMES[i]}</div>
              <div className={`text-sm mt-0.5 ${today ? 'bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto font-bold' : 'text-gray-300'}`}>
                {day.getDate()}
              </div>
              {today && <div className="text-[9px] text-orange-400 mt-0.5 font-medium">TODAY</div>}
            </div>
          )
        })}

        {weekDays.map((day, i) => {
          const daySchedules = getSchedulesForDate(schedules, day)
          const today = isToday(day)
          const now = new Date(); now.setHours(0, 0, 0, 0)
          const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0)
          const isPast = dayStart.getTime() < now.getTime() && !today

          return (
            <div key={`col-${i}`}
              className={`min-h-[160px] rounded-b-lg p-1.5 border transition-colors ${
                today ? 'bg-orange-500/5 border-orange-500/20'
                  : isPast ? 'bg-zinc-950/50 border-zinc-800/50'
                  : 'bg-zinc-900/50 border-zinc-800'
              }`}>
              <div className="space-y-1">
                {daySchedules.map(schedule => {
                  const diff = schedule.difficulty
                  const colorClass = diff ? DIFFICULTY_COLORS[diff] : 'bg-zinc-800 border-zinc-700 text-gray-300'
                  const dotClass = diff ? DIFFICULTY_DOT[diff] : 'bg-zinc-500'
                  const nowMs = Date.now()
                  const isLive = new Date(schedule.starts_at).getTime() <= nowMs && new Date(schedule.ends_at).getTime() >= nowMs

                  return (
                    <button key={schedule.id} onClick={() => onEditSchedule(schedule)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-all hover:brightness-110 ${colorClass} ${isLive ? 'ring-1 ring-green-400/50' : ''}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass} ${isLive ? 'animate-pulse' : ''}`} />
                        <span className="font-semibold truncate uppercase tracking-wide text-[11px]">{schedule.move_name}</span>
                      </div>
                      {diff && <div className="text-[10px] opacity-70 capitalize ml-3">{diff}</div>}
                      <div className="text-[10px] opacity-50 ml-3 mt-0.5">{formatTime(schedule.starts_at)} – {formatTime(schedule.ends_at)}</div>
                    </button>
                  )
                })}
              </div>
              <button onClick={() => onAddToDay(day)}
                className="w-full mt-1.5 py-1.5 rounded-lg border border-dashed border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 text-zinc-600 hover:text-orange-400 text-xs transition-colors flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Mobile: stacked card list */}
      <div className="md:hidden space-y-2">
        {weekDays.map((day, i) => {
          const today = isToday(day)
          const daySchedules = getSchedulesForDate(schedules, day)
          const now = new Date(); now.setHours(0, 0, 0, 0)
          const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0)
          const isPast = dayStart.getTime() < now.getTime() && !today

          return (
            <div key={`mobile-${i}`}
              className={`rounded-xl border overflow-hidden ${
                today ? 'border-orange-500/30 bg-orange-500/5'
                  : isPast ? 'border-zinc-800/50 bg-zinc-950/50 opacity-60'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}>
              {/* Day header */}
              <div className={`flex items-center justify-between px-3 py-2 ${today ? 'bg-orange-500/10' : 'bg-zinc-900'}`}>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-bold ${today ? 'bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-300'}`}>
                    {day.getDate()}
                  </div>
                  <div>
                    <span className="text-sm text-white font-medium">{DAY_NAMES[i]}</span>
                    {today && <span className="text-[10px] text-orange-400 font-medium ml-2">TODAY</span>}
                  </div>
                </div>
                <button onClick={() => onAddToDay(day)}
                  className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500 rounded-md px-2 py-1 transition-colors">
                  + Add
                </button>
              </div>

              {/* Schedules */}
              {daySchedules.length > 0 ? (
                <div className="p-2 space-y-1.5">
                  {daySchedules.map(schedule => {
                    const diff = schedule.difficulty
                    const colorClass = diff ? DIFFICULTY_COLORS[diff] : 'bg-zinc-800 border-zinc-700 text-gray-300'
                    const dotClass = diff ? DIFFICULTY_DOT[diff] : 'bg-zinc-500'
                    const nowMs = Date.now()
                    const isLive = new Date(schedule.starts_at).getTime() <= nowMs && new Date(schedule.ends_at).getTime() >= nowMs

                    return (
                      <button key={schedule.id} onClick={() => onEditSchedule(schedule)}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-all hover:brightness-110 ${colorClass} ${isLive ? 'ring-1 ring-green-400/50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass} ${isLive ? 'animate-pulse' : ''}`} />
                            <span className="font-bold truncate uppercase tracking-wide">{schedule.move_name}</span>
                            {diff && <span className="text-xs opacity-70 capitalize shrink-0">{diff}</span>}
                          </div>
                          <span className="text-xs opacity-50 shrink-0 ml-2">
                            {formatTime(schedule.starts_at)} – {formatTime(schedule.ends_at)}
                          </span>
                        </div>
                        {schedule.label && <p className="text-xs opacity-40 mt-1 truncate">{schedule.label}</p>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-600">No schedules</div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
