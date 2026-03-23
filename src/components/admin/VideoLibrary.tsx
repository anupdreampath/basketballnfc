'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Video, DeviceType, Difficulty } from '@/types'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '@/types'
import VideoCard from './VideoCard'
import CloudinaryUploadWidget from './CloudinaryUploadWidget'
import { getThumbnailFromVideoUrl } from '@/lib/cloudinary-url'

const DEVICE_TABS: { label: string; value: DeviceType; icon: string }[] = [
  { label: 'Mobile', value: 'mobile', icon: '📱' },
  { label: 'Tablet', value: 'tablet', icon: '📟' },
  { label: 'Desktop', value: 'desktop', icon: '🖥️' },
]

interface UploadMeta {
  moveName: string
  difficulty: Difficulty
}

export default function VideoLibrary() {
  const [activeTab, setActiveTab] = useState<DeviceType>('mobile')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [existingMoves, setExistingMoves] = useState<string[]>([])

  // Upload meta modal state
  const [uploadMeta, setUploadMeta] = useState<UploadMeta>({ moveName: '', difficulty: 'beginner' })
  const [showMetaModal, setShowMetaModal] = useState(false)
  const [pendingUpload, setPendingUpload] = useState<{ public_id: string; secure_url: string; duration?: number; bytes?: number } | null>(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    const [videosRes, movesRes] = await Promise.all([
      fetch(`/api/videos?device=${activeTab}`),
      fetch('/api/moves'),
    ])
    const videosData = await videosRes.json()
    const movesData = await movesRes.json()
    setVideos(Array.isArray(videosData) ? videosData : [])
    setExistingMoves((movesData as any[]).map((m: any) => m.move_name))
    setLoading(false)
  }, [activeTab])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  async function handleUploadSuccess(result: { public_id: string; secure_url: string; duration?: number; bytes?: number }) {
    setPendingUpload(result)
    setShowMetaModal(true)
  }

  async function handleMetaSave() {
    if (!pendingUpload || !uploadMeta.moveName.trim()) return
    setShowMetaModal(false)

    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${uploadMeta.moveName} — ${DIFFICULTY_LABELS[uploadMeta.difficulty]} (${activeTab})`,
        move_name: uploadMeta.moveName.trim(),
        difficulty: uploadMeta.difficulty,
        device_type: activeTab,
        cloudinary_id: pendingUpload.public_id,
        cloudinary_url: pendingUpload.secure_url,
        thumbnail_url: getThumbnailFromVideoUrl(pendingUpload.secure_url),
        duration_secs: pendingUpload.duration ? Math.round(pendingUpload.duration) : null,
        file_size_mb: pendingUpload.bytes ? parseFloat((pendingUpload.bytes / 1_048_576).toFixed(2)) : null,
      }),
    })

    if (res.ok) {
      setUploadMeta({ moveName: '', difficulty: 'beginner' })
      setPendingUpload(null)
      await fetchVideos()
    }
  }

  return (
    <div>
      {/* Upload meta modal */}
      {showMetaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-sm border border-zinc-700">
            <h3 className="text-white font-semibold mb-1">Tag this video</h3>
            <p className="text-gray-500 text-sm mb-4">Assign a move name and difficulty level.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Move Name</label>
                <input
                  autoFocus
                  list="existing-moves"
                  type="text"
                  value={uploadMeta.moveName}
                  onChange={(e) => setUploadMeta(m => ({ ...m, moveName: e.target.value }))}
                  placeholder="e.g. Smash, Crossover, Dunk…"
                  className="w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 placeholder-gray-600"
                />
                <datalist id="existing-moves">
                  {existingMoves.map(m => <option key={m} value={m} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setUploadMeta(m => ({ ...m, difficulty: d }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        uploadMeta.difficulty === d
                          ? d === 'beginner' ? 'bg-green-600 text-white'
                            : d === 'intermediate' ? 'bg-orange-500 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-zinc-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 text-gray-600 text-xs">
                Uploading for: <span className="text-gray-400 capitalize">{activeTab}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowMetaModal(false); setPendingUpload(null) }}
                className="flex-1 text-gray-400 border border-zinc-700 rounded-lg py-2 text-sm hover:border-zinc-500"
              >
                Cancel
              </button>
              <button
                onClick={handleMetaSave}
                disabled={!uploadMeta.moveName.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg py-2 text-sm font-medium"
              >
                Save Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + upload */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
          {DEVICE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.value ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        <CloudinaryUploadWidget deviceType={activeTab} onSuccess={handleUploadSuccess} />
      </div>

      {/* Video grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl aspect-video animate-pulse" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-sm">No {activeTab} videos yet. Upload one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
              onUpdate={(updated) => setVideos(prev => prev.map(v => v.id === updated.id ? updated : v))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
