'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Difficulty } from '@/types'

interface Props {
  difficulty: Difficulty
  onComplete: () => void
}

const LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  pro: 'Pro',
}

const serif = 'var(--font-cormorant), Georgia, "Times New Roman", serif'

export default function DifficultyIntro({ difficulty, onComplete }: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setShow(false), 2000)
    const doneTimer = setTimeout(() => onComplete(), 2700)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Blurred dark layover — lets background show through blurred
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div style={{ textAlign: 'center', position: 'relative', padding: '0 40px' }}>

            {/* Soft ambient glow behind text */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '200px',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }}
            />

            {/* Difficulty word — Cormorant Garamond italic, elegant and large */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <p
                style={{
                  fontFamily: serif,
                  color: 'rgba(255,255,255,0.90)',
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  margin: 0,
                  lineHeight: 1,
                  // Subtle blur on text itself for the "blurred" feel
                  textShadow: '0 0 40px rgba(255,255,255,0.12)',
                }}
              >
                {LABELS[difficulty]}
              </p>

              {/* Animated underline */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
                style={{
                  height: '1px',
                  marginTop: 14,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 80%, transparent)',
                  transformOrigin: 'center',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
