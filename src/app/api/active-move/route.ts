import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveActiveMove } from '@/lib/active-video-logic'
import type { DeviceType } from '@/types'

export const dynamic = 'force-dynamic'

const VALID_DEVICES: DeviceType[] = ['mobile', 'tablet', 'desktop']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const device = searchParams.get('device') as DeviceType

  if (!device || !VALID_DEVICES.includes(device)) {
    return NextResponse.json(
      { error: 'Missing or invalid ?device= param. Use mobile, tablet, or desktop.' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  const [{ data: settings }, { data: schedules }, { data: videos }] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase
      .from('schedules')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', new Date().toISOString())
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: false })
      .limit(1),
    supabase
      .from('videos')
      .select('move_name, difficulty, device_type')
      .eq('device_type', device)
      .order('created_at', { ascending: false }),
  ])

  if (!settings) {
    return NextResponse.json({ error: 'Could not load settings' }, { status: 500 })
  }

  const result = resolveActiveMove(
    device,
    settings as any,
    schedules ?? [],
    videos ?? []
  )

  if (!result) {
    return NextResponse.json({ error: 'no_move_found' }, { status: 404 })
  }

  return NextResponse.json({
    ...result,
    display_name: (settings as any).front_page_title ?? result.move_name,
    description: (settings as any).move_description ?? null,
    level: (settings as any).move_level ?? null,
    quote: (settings as any).move_quote ?? null,
    default_difficulty: (settings as any).default_difficulty ?? result.default_difficulty,
  }, {
    headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' },
  })
}
