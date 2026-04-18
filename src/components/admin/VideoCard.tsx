'use client'

import { useState } from 'react'
import type { Video, Difficulty } from '@/types'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '@/types'
import { getThumbnailFromVideoUrl } from '@/lib/cloudinary-url'
import { getExternalThumbnail } from '@/lib/video-url'

interface Props {
  video: Video
  onDelete: (id: string) => void
  onUpdate: (video: Video) => void
}

function formatDuration(secs: number | null): string {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatSize(mb: number | null): string {
  if (!mb) return '—'
  return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: 'bg-green-500/20 text-green-300',
  intermediate: 'bg-orange-500/20 text-orange-300',
  pro: 'bg-red-500/20 text-red-300',
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: 'bg-blue-500/20 text-blue-300',
  tablet: 'bg-purple-500/20 text-purple-300',
  desktop: 'bg-zinc-500/20 text-zinc-300',
}

export default function VideoCard({ video, onDelete, onUpdate }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingDiff, setSavingDiff] = useState(false)

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
    onDelete(video.id)
  }

  async function handleDifficultyChange(newDiff: Difficulty) {
    if (newDiff === video.difficulty) return
    setSavingDiff(true)
    const res = await fetch(`/api/videos/${video.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: newDiff }),
    })
    if (res.ok) {
      const updated: Video = await res.json()
      onUpdate(updated)
    }
    setSavingDiff(false)
  }

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* Thumbnail */}
      <div className="aspect-video bg-zinc-800 relative">
        {video.cloudinary_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url ?? getExternalThumbnail(video.cloudinary_url) ?? getThumbnailFromVideoUrl(video.cloudinary_url)}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <select
            value={video.difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
            disabled={savingDiff}
            autoComplete="off"
            name={`diff-${video.id}`}
            className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${
              savingDiff ? 'opacity-50' : ''
            } ${DIFFICULTY_COLORS[video.difficulty]}`}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEVICE_COLORS[video.device_type]}`}>
            {video.device_type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{video.move_name}</p>
        <p className="text-white text-sm font-medium truncate">{video.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-gray-500 text-xs">{formatDuration(video.duration_secs)}</span>
          <span className="text-gray-500 text-xs">{formatSize(video.file_size_mb)}</span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <a
            href={video.cloudinary_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs text-gray-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-md py-1.5 transition-colors"
          >
            Preview
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            onBlur={() => setConfirming(false)}
            className={`flex-1 text-xs rounded-md py-1.5 transition-colors ${
              confirming ? 'bg-red-500 text-white hover:bg-red-600' : 'text-red-400 hover:text-red-300 border border-zinc-700 hover:border-red-800'
            }`}
          >
            {deleting ? 'Deleting…' : confirming ? 'Confirm' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
