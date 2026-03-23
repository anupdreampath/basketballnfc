export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type Difficulty = 'beginner' | 'intermediate' | 'pro'

export const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'pro']

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  pro: 'Pro',
}

export interface Video {
  id: string
  title: string
  move_name: string
  difficulty: Difficulty
  device_type: DeviceType
  cloudinary_id: string
  cloudinary_url: string
  thumbnail_url: string | null
  duration_secs: number | null
  file_size_mb: number | null
  created_at: string
}

export interface Schedule {
  id: string
  video_id: string | null
  move_name: string | null
  device_type: DeviceType
  starts_at: string
  ends_at: string
  label: string | null
  is_active: boolean
  created_at: string
  video?: Video
}

export interface Settings {
  id: string
  scheduler_enabled: boolean
  override_move_name: string | null
  front_page_title: string | null
  slot_beginner_mobile_id: string | null
  slot_beginner_tablet_id: string | null
  slot_beginner_desktop_id: string | null
  slot_intermediate_mobile_id: string | null
  slot_intermediate_tablet_id: string | null
  slot_intermediate_desktop_id: string | null
  slot_pro_mobile_id: string | null
  slot_pro_tablet_id: string | null
  slot_pro_desktop_id: string | null
  // legacy per-device overrides kept for backward compat
  override_mobile_video_id: string | null
  override_tablet_video_id: string | null
  override_desktop_video_id: string | null
  updated_at: string
  override_mobile?: Video | null
  override_tablet?: Video | null
  override_desktop?: Video | null
}

export interface MoveInfo {
  move_name: string
  difficulties: Difficulty[]
  devices: DeviceType[]
}

export interface ActiveMoveResponse {
  move_name: string       // used for video lookup (internal)
  display_name: string    // shown in hero (= front_page_title ?? move_name)
  difficulties: Difficulty[]
  default_difficulty: Difficulty
  source: 'override' | 'schedule' | 'fallback'
}

export interface ActiveVideoResponse {
  url: string
  videoId: string
  move_name: string
  difficulty: Difficulty
  source: 'override' | 'schedule' | 'fallback'
}
