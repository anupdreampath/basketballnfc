import type { DeviceType } from '@/types'

export const DEVICE_BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
} as const

export function getDeviceType(width: number): DeviceType {
  if (width < DEVICE_BREAKPOINTS.TABLET_MIN) return 'mobile'
  if (width < DEVICE_BREAKPOINTS.DESKTOP_MIN) return 'tablet'
  return 'desktop'
}

export function detectDeviceFromUA(ua: string): DeviceType {
  if (/Mobi|Android/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'default'
