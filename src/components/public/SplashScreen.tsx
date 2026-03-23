'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2200)
    const done = setTimeout(() => onComplete(), 2700)
    return () => { clearTimeout(timer); clearTimeout(done) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ position: 'relative', width: 200, height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* Spotlight on ground — wide ambient glow */}
            <div style={{
              position: 'absolute',
              bottom: -20,
              width: 200,
              height: 80,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Ground line — subtle floor indicator */}
            <div style={{
              position: 'absolute',
              bottom: 18,
              width: 140,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 70%, transparent)',
            }} />

            {/* Ball with bounce */}
            <motion.div
              animate={{
                y: [0, -160, 0, -90, 0, -40, 0, -14, 0],
              }}
              transition={{
                duration: 2.0,
                times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                ease: 'easeInOut',
                repeat: 0,
              }}
              style={{ position: 'absolute', bottom: 30 }}
            >
              {/* Ball with squash/stretch */}
              <motion.div
                animate={{
                  scaleX: [1, 1, 1.25, 1, 1, 1.15, 1, 1, 1.08, 1],
                  scaleY: [1, 1, 0.78, 1, 1, 0.85, 1, 1, 0.92, 1],
                }}
                transition={{
                  duration: 2.0,
                  times: [0, 0.23, 0.25, 0.3, 0.46, 0.48, 0.53, 0.68, 0.7, 0.75],
                  ease: 'easeInOut',
                }}
                style={{ originY: 1 }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse at 30% 25%, #fb923c 0%, #ea580c 45%, #9a3412 100%)',
                    boxShadow: '0 4px 24px rgba(249,115,22,0.3), inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 2px 8px rgba(255,255,255,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Basketball seam lines */}
                  <svg viewBox="0 0 76 76" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <path d="M3 38 Q38 28 73 38" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8" fill="none" />
                    <path d="M3 38 Q38 48 73 38" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8" fill="none" />
                    <line x1="38" y1="2" x2="38" y2="74" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8" />
                    <path d="M16 8 Q28 22 20 38" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
                    <path d="M60 8 Q48 22 56 38" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
                    <path d="M16 68 Q28 54 20 38" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
                    <path d="M60 68 Q48 54 56 38" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
                  </svg>
                  {/* Highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 14,
                    width: 22,
                    height: 16,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    filter: 'blur(6px)',
                  }} />
                </div>
              </motion.div>
            </motion.div>

            {/* Impact flash — bright burst on each bounce contact */}
            <motion.div
              animate={{
                opacity: [0, 0, 0.6, 0, 0, 0.4, 0, 0, 0.25, 0],
                scale: [0.5, 0.5, 1.3, 0.5, 0.5, 1.2, 0.5, 0.5, 1.1, 0.5],
              }}
              transition={{
                duration: 2.0,
                times: [0, 0.23, 0.25, 0.3, 0.46, 0.48, 0.53, 0.68, 0.7, 0.75],
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                bottom: 10,
                width: 100,
                height: 20,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0.15) 40%, transparent 70%)',
                filter: 'blur(8px)',
                pointerEvents: 'none',
              }}
            />

            {/* Ground shadow — tracks ball height */}
            <motion.div
              animate={{
                scaleX: [1, 0.3, 1.2, 0.5, 1.1, 0.65, 1, 0.8, 1],
                opacity: [0.6, 0.08, 0.7, 0.15, 0.55, 0.2, 0.45, 0.3, 0.35],
              }}
              transition={{
                duration: 2.0,
                times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                ease: 'easeInOut',
              }}
              style={{
                width: 80,
                height: 14,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, rgba(249,115,22,0.12) 40%, transparent 70%)',
                filter: 'blur(5px)',
                marginBottom: 6,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
