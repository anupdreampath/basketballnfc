import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Difficulty, DeviceType, MoveInfo } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('videos')
    .select('move_name, difficulty, device_type')
    .order('move_name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by move_name
  const moveMap = new Map<string, MoveInfo>()
  for (const row of data ?? []) {
    if (!moveMap.has(row.move_name)) {
      moveMap.set(row.move_name, { move_name: row.move_name, difficulties: [], devices: [] })
    }
    const info = moveMap.get(row.move_name)!
    if (!info.difficulties.includes(row.difficulty as Difficulty)) {
      info.difficulties.push(row.difficulty as Difficulty)
    }
    if (!info.devices.includes(row.device_type as DeviceType)) {
      info.devices.push(row.device_type as DeviceType)
    }
  }

  return NextResponse.json(Array.from(moveMap.values()))
}
