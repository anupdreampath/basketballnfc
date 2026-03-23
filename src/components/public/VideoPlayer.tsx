'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useDeviceType } from '@/hooks/useDeviceType'
import { useActiveMoveInfo } from '@/hooks/useActiveMoveInfo'
import SplashScreen from './SplashScreen'
import HeroOverlay from './HeroOverlay'
import type { DeviceType, Difficulty } from '@/types'

type PlayerState = 'splash' | 'hero' | 'playing'

interface Props {
  defaultDeviceType: DeviceType
}

export default function VideoPlayer({ defaultDeviceType }: Props) {
  const deviceType = useDeviceType(defaultDeviceType)
  const { moveInfo } = useActiveMoveInfo(deviceType)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [state, setState] = useState<PlayerState>('splash')
  const [splashDone, setSplashDone] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [heroVisible, setHeroVisible] = useState(false)

  // Transition splash → hero once both splash timer AND move data are ready
  useEffect(() => {
    if (splashDone && moveInfo && state === 'splash') {
      setState('hero')
      setHeroVisible(true)
    }
  }, [splashDone, moveInfo, state])

  const handleWatch = useCallback(async (difficulty: Difficulty) => {
    if (!moveInfo) return
    setHeroVisible(false)

    const res = await fetch(
      `/api/video?move=${encodeURIComponent(moveInfo.move_name)}&difficulty=${difficulty}&device=${deviceType}`
    )
    if (!res.ok) { setState('playing'); return }
    const data = await res.json()
    setVideoUrl(data.url)
  }, [moveInfo, deviceType])

  // Play video once URL is available
  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoUrl) return
    el.src = videoUrl
    el.load()
    el.play()
      .then(() => {
        setTimeout(() => setState('playing'), 600) // wait for hero fade-out
      })
      .catch(() => setState('playing'))
  }, [videoUrl])

  return (
    <>
      {/* Background video — always present but hidden until playing */}
      <video
        ref={videoRef}
        autoPlay
        muted={false}
        loop
        playsInline
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          background: '#000',
          opacity: state === 'playing' ? 1 : state === 'hero' ? 0.25 : 0,
          transition: 'opacity 0.8s ease',
          zIndex: 1,
        }}
      />

      {/* Splash screen */}
      {state === 'splash' && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}

      {/* Hero overlay */}
      {(state === 'hero' || (state === 'playing' && heroVisible)) && moveInfo && (
        <HeroOverlay
          moveName={moveInfo.display_name ?? moveInfo.move_name}
          availableDifficulties={moveInfo.difficulties}
          onWatch={handleWatch}
          visible={heroVisible}
        />
      )}
    </>
  )
}
