'use client'

import { useState, useEffect } from 'react'
import type { DeviceType } from '@/types'
import { getDeviceType } from '@/lib/constants'

export function useDeviceType(defaultDevice: DeviceType = 'desktop'): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(defaultDevice)

  useEffect(() => {
    const compute = () => getDeviceType(window.innerWidth)
    setDeviceType(compute())

    const handler = () => setDeviceType(compute())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return deviceType
}
