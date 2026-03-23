'use client'

import useSWR from 'swr'
import type { DeviceType, ActiveMoveResponse } from '@/types'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

export function useActiveMoveInfo(deviceType: DeviceType) {
  const { data, isLoading } = useSWR<ActiveMoveResponse | null>(
    `/api/active-move?device=${deviceType}`,
    fetcher,
    { refreshInterval: 30_000 }
  )

  return {
    moveInfo: data ?? null,
    loading: isLoading,
  }
}
