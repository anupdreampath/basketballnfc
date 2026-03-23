'use client'

import useSWR from 'swr'
import type { DeviceType, ActiveVideoResponse } from '@/types'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok && res.status !== 404) throw new Error('Failed to fetch')
    if (res.status === 404) return null
    return res.json()
  })

export function useActiveVideo(deviceType: DeviceType) {
  const { data, error, isLoading } = useSWR<ActiveVideoResponse | null>(
    `/api/active-video?device=${deviceType}`,
    fetcher,
    { refreshInterval: 30_000 }
  )

  return {
    video: data ?? null,
    loading: isLoading,
    error: error ? 'Failed to load video' : null,
  }
}
