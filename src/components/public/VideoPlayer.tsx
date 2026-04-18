'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useDeviceType } from '@/hooks/useDeviceType'
import { useActiveMoveInfo } from '@/hooks/useActiveMoveInfo'
import SplashScreen from './SplashScreen'
import HeroOverlay from './HeroOverlay'
import DifficultyIntro from './DifficultyIntro'
import type { DeviceType, Difficulty } from '@/types'
import { isEmbedUrl } from '@/lib/video-url'

type PlayerState = 'splash' | 'hero' | 'difficulty-intro' | 'loading' | 'playing'

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
  const [chosenDifficulty, setChosenDifficulty] = useState<Difficulty | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const isEmbed = videoUrl ? isEmbedUrl(videoUrl) : false

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
    setChosenDifficulty(difficulty)
    setState('difficulty-intro') // Show calligraphic difficulty intro first
  }, [moveInfo])

  const handleIntroComplete = useCallback(async () => {
    if (!moveInfo || !chosenDifficulty) return
    setState('loading')

    const res = await fetch(
      `/api/video?move=${encodeURIComponent(moveInfo.move_name)}&difficulty=${chosenDifficulty}&device=${deviceType}`
    )
    if (!res.ok) {
      setVideoError('Video not available. Please try again later.')
      setState('playing')
      return
    }
    const data = await res.json()
    setVideoUrl(data.url)
  }, [moveInfo, chosenDifficulty, deviceType])

  // Play native video once URL is available (skip for embeds)
  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoUrl || isEmbed) return

    const handleError = () => {
      setVideoError('Video failed to load. The file may no longer be available.')
      setState('playing')
    }
    el.addEventListener('error', handleError)

    el.src = videoUrl
    el.load()
    el.play()
      .then(() => {
        setTimeout(() => setState('playing'), 600)
      })
      .catch(() => {
        setVideoError('Video failed to play. Please try again.')
        setState('playing')
      })

    return () => el.removeEventListener('error', handleError)
  }, [videoUrl, isEmbed])

  // Transition to playing for embed iframes
  useEffect(() => {
    if (!videoUrl || !isEmbed) return
    const timer = setTimeout(() => setState('playing'), 1200)
    return () => clearTimeout(timer)
  }, [videoUrl, isEmbed])

  return (
    <>
      {/* Background video — hidden when using an embed */}
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
          opacity: isEmbed ? 0 : state === 'playing' ? 1 : (state === 'hero' || state === 'difficulty-intro') ? 0.3 : 0,
          transition: 'opacity 0.8s ease',
          zIndex: 1,
        }}
      />

      {/* Iframe for YouTube / Vimeo embeds */}
      {isEmbed && videoUrl && (
        <iframe
          src={videoUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'max(100vw, 177.78vh)',
            height: 'max(100vh, 56.25vw)',
            border: 'none',
            background: '#000',
            opacity: state === 'playing' ? 1 : 0,
            transition: 'opacity 0.8s ease',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Splash screen - also shown during video loading */}
      {(state === 'splash' || state === 'loading') && (
        <SplashScreen
          onComplete={() => {
            if (state === 'splash') setSplashDone(true)
          }}
          isLoading={state === 'loading'}
        />
      )}

      {/* Difficulty intro splash — calligraphic text before video */}
      {state === 'difficulty-intro' && chosenDifficulty && (
        <DifficultyIntro
          difficulty={chosenDifficulty}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Video error overlay */}
      {state === 'playing' && videoError && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          gap: '16px',
        }}>
          <p style={{ color: '#f97316', fontSize: '18px', fontWeight: 600 }}>{videoError}</p>
          <button
            onClick={() => {
              setVideoError(null)
              setVideoUrl(null)
              setHeroVisible(true)
              setState('hero')
            }}
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      )}

      {/* Hero overlay */}
      {(state === 'hero' || (state === 'playing' && heroVisible)) && moveInfo && (
        <HeroOverlay
          moveName={moveInfo.display_name ?? moveInfo.move_name}
          defaultDifficulty={moveInfo.default_difficulty}
          description={moveInfo.description}
          level={moveInfo.level}
          quote={moveInfo.quote}
          onWatch={handleWatch}
          visible={heroVisible}
        />
      )}
    </>
  )
}
