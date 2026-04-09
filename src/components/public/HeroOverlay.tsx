'use client'

import Image from 'next/image'
import type { Difficulty } from '@/types'

interface Props {
  moveName: string
  defaultDifficulty: Difficulty
  description?: string | null
  level?: string | null
  quote?: string | null
  onWatch: (difficulty: Difficulty) => void
  visible: boolean
}

const serif   = 'var(--font-cormorant), Georgia, "Times New Roman", serif'
const display = 'var(--font-montserrat), "Helvetica Neue", Arial, sans-serif'
const sansUI  = 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif'

export default function HeroOverlay({
  moveName,
  defaultDifficulty,
  description,
  level,
  quote,
  onWatch,
  visible,
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'rgba(0,0,0,0.90)',
        transition: 'opacity 0.6s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        padding: '1.5rem',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 24 }}>
        <Image
          src="/white_logo-removebg-preview.png"
          alt="Logo"
          width={120}
          height={60}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* "move of the day" — outside card, Cormorant 300 italic */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          width: '100%',
          maxWidth: 620,
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.18)' }} />
        <p
          style={{
            fontFamily: serif,
            fontSize: '1rem',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          move of the day
        </p>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.18)' }} />
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(10,10,10,0.6)',
        }}
      >
        <div style={{ padding: '52px 48px 40px', textAlign: 'center' }}>

          {/* Title — Montserrat Black, fits on one line */}
          <h1
            style={{
              fontFamily: display,
              fontSize: 'clamp(2.0rem, 8vw, 3.6rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.15,
              color: '#ffffff',
              margin: 0,
              marginBottom: description ? 22 : 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {moveName}
          </h1>

          {/* Description */}
          {description && (
            <p
              style={{
                fontFamily: sansUI,
                fontSize: '1.05rem',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.65)',
                margin: 0,
              }}
            >
              {description}
            </p>
          )}

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.10)',
              margin: '32px 0',
            }}
          />

          {/* Level */}
          {level && (
            <p
              style={{
                fontFamily: display,
                fontSize: '1rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.80)',
                margin: '0 0 18px 0',
              }}
            >
              {level}
            </p>
          )}

          {/* Quote — Cormorant italic */}
          {quote && (
            <p
              style={{
                fontFamily: serif,
                fontSize: '1.25rem',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.55)',
                margin: '0 0 36px 0',
              }}
            >
              &ldquo;{quote}&rdquo;
            </p>
          )}

          {/* Watch Video button */}
          <button
            onClick={() => onWatch(defaultDifficulty)}
            style={{
              width: '100%',
              padding: '18px',
              background: '#f97316',
              color: '#fff',
              border: 'none',
              fontFamily: sansUI,
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ea580c' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f97316' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Video
          </button>

          {/* YOUR TURN */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 22,
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <p
              style={{
                fontFamily: sansUI,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#f97316',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Your Turn
            </p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

        </div>
      </div>
    </div>
  )
}
