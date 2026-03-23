import type { Settings, Schedule, DeviceType, Difficulty, ActiveMoveResponse } from '@/types'

type VideoSlim = { move_name: string; difficulty: Difficulty }

export function resolveActiveMove(
  device: DeviceType,
  settings: Settings,
  currentSchedules: Schedule[],
  allDeviceVideos: VideoSlim[],
): ActiveMoveResponse | null {
  let moveName: string | null = null
  let source: 'override' | 'schedule' | 'fallback' = 'fallback'

  // 1. Manual override
  if (!settings.scheduler_enabled && settings.override_move_name) {
    moveName = settings.override_move_name
    source = 'override'
  }

  // 2. Active schedule
  if (!moveName && settings.scheduler_enabled && currentSchedules.length > 0) {
    moveName = currentSchedules[0].move_name ?? null
    source = 'schedule'
  }

  // 3. Fallback — most recently uploaded video's move_name
  if (!moveName && allDeviceVideos.length > 0) {
    moveName = allDeviceVideos[0].move_name
    source = 'fallback'
  }

  if (!moveName) return null

  // Find which difficulties are available via slot assignments OR move_name matching
  const slotDifficulties: Difficulty[] = (['beginner', 'intermediate', 'pro'] as Difficulty[]).filter((d) => {
    const slotKey = `slot_${d}_${device}_id` as keyof Settings
    return !!(settings as any)[slotKey]
  })

  const moveDifficulties = allDeviceVideos
    .filter((v) => v.move_name === moveName)
    .map((v) => v.difficulty)

  // Merge both sources — slots take priority but move-based videos also count
  const allDifficulties = new Set([...slotDifficulties, ...moveDifficulties])

  // Always show beginner first if available
  const ordered: Difficulty[] = ['beginner', 'intermediate', 'pro'].filter((d) =>
    allDifficulties.has(d as Difficulty)
  ) as Difficulty[]

  if (ordered.length === 0) {
    // Move exists in settings/schedule but no video for this device
    return null
  }

  return {
    move_name: moveName,
    display_name: moveName,
    difficulties: ordered,
    default_difficulty: ordered[0],
    source,
  }
}
