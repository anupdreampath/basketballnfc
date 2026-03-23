'use client'

import { useState } from 'react'
import type { Difficulty } from '@/types'
import { DIFFICULTY_LABELS } from '@/types'

interface Props {
  moveName: string
  availableDifficulties: Difficulty[]
  onWatch: (difficulty: Difficulty) => void
  visible: boolean
}

export default function HeroOverlay({ moveName, availableDifficulties, onWatch, visible }: Props) {
  const [selected, setSelected] = useState<Difficulty>(availableDifficulties[0])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.88)',
        transition: 'opacity 0.6s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        padding: '1.5rem',
      }}
    >
      {/* Boxy card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Move name section */}
        <div
          style={{
            padding: '40px 32px 32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(2rem, 8vw, 3.5rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {moveName}
          </h1>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.35)',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: 12,
            }}
          >
            Select difficulty
          </p>
        </div>

        {/* Difficulty tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {availableDifficulties.map((d) => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              style={{
                flex: 1,
                padding: '14px 8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: 'none',
                borderBottom: selected === d ? '2px solid #f97316' : '2px solid transparent',
                background: selected === d ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: selected === d ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.2s',
              }}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Watch button */}
        <div style={{ padding: '20px 24px' }}>
          <button
            onClick={() => onWatch(selected)}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f97316',
              color: '#fff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ea580c' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f97316' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Video
          </button>
        </div>
      </div>
    </div>
  )
}
