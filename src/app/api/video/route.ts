import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { DeviceType, Difficulty } from '@/types'

export const dynamic = 'force-dynamic'

const DIFFICULTY_FALLBACK: Difficulty[] = ['beginner', 'intermediate', 'pro']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const move = searchParams.get('move')
  const difficulty = searchParams.get('difficulty') as Difficulty
  const device = searchParams.get('device') as DeviceType

  if (!move || !difficulty || !device) {
    return NextResponse.json(
      { error: 'Required params: move, difficulty, device' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // Check explicit slot assignment in settings first
  const { data: settings } = await supabase.from('settings').select('*').single()
  if (settings) {
    const slotKey = `slot_${difficulty}_${device}_id`
    const slotVideoId = (settings as Record<string, unknown>)[slotKey] as string | null
    if (slotVideoId) {
      const { data: slotVideo } = await supabase.from('videos').select('*').eq('id', slotVideoId).single()
      if (slotVideo) {
        return NextResponse.json({
          url: slotVideo.cloudinary_url,
          videoId: slotVideo.id,
          move_name: slotVideo.move_name,
          difficulty: slotVideo.difficulty,
        })
      }
    }
  }

  // Fetch all videos for this move across all devices, prefer requested device
  const { data: allVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('move_name', move)
    .order('created_at', { ascending: false })

  if (!allVideos || allVideos.length === 0) {
    return NextResponse.json({ error: 'no_video_found' }, { status: 404 })
  }

  // Device preference order: requested first, then mobile, desktop, tablet
  const deviceOrder: DeviceType[] = [device, 'mobile', 'desktop', 'tablet'].filter(
    (d, i, arr) => arr.indexOf(d) === i
  ) as DeviceType[]

  // Pick videos for best available device
  let videos = allVideos.filter((v) => v.device_type === device)
  if (videos.length === 0) {
    for (const d of deviceOrder) {
      const candidates = allVideos.filter((v) => v.device_type === d)
      if (candidates.length > 0) { videos = candidates; break }
    }
  }

  if (videos.length === 0) {
    return NextResponse.json({ error: 'no_video_found' }, { status: 404 })
  }

  // Find exact match first
  let video = videos.find((v) => v.difficulty === difficulty)

  // Fallback through difficulty order
  if (!video) {
    for (const d of DIFFICULTY_FALLBACK) {
      video = videos.find((v) => v.difficulty === d)
      if (video) break
    }
  }

  if (!video) {
    return NextResponse.json({ error: 'no_video_found' }, { status: 404 })
  }

  return NextResponse.json({
    url: video.cloudinary_url,
    videoId: video.id,
    move_name: video.move_name,
    difficulty: video.difficulty,
  })
}
