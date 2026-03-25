'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
  isLoading?: boolean
}

export default function SplashScreen({ onComplete, isLoading = false }: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (isLoading) {
      // For loading state, keep showing indefinitely until isLoading changes
      setShow(true)
      return () => {}
    } else {
      // Normal splash behavior
      const timer = setTimeout(() => setShow(false), 2200)
      const done = setTimeout(() => onComplete(), 2700)
      return () => { clearTimeout(timer); clearTimeout(done) }
    }
  }, [onComplete, isLoading])

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
          <div style={{ 
            position: 'relative', 
            width: 320, 
            height: 400, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            transform: 'translateY(-15vh)' // Shift upward by 15% of viewport height
          }}>
            {/* Spotlight on ground — wide ambient glow */}
            <div style={{
              position: 'absolute',
              bottom: -30,
              width: 320,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Ground line — subtle floor indicator */}
            <div style={{
              position: 'absolute',
              bottom: 25,
              width: 220,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 70%, transparent)',
            }} />

            {/* Ball with bounce */}
            <motion.div
              animate={{
                y: [0, -180, 0, -100, 0, -45, 0, -16, 0],
              }}
              transition={{
                duration: 2.0,
                times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                ease: 'easeInOut',
                repeat: isLoading ? Infinity : 0,
              }}
              style={{ position: 'absolute', bottom: 35 }}
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
                  repeat: isLoading ? Infinity : 0,
                }}
                style={{ originY: 1 }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse at 30% 25%, #fb923c 0%, #ea580c 45%, #9a3412 100%)',
                    boxShadow: '0 6px 32px rgba(249,115,22,0.4), inset 0 -6px 16px rgba(0,0,0,0.4), inset 0 3px 12px rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Basketball seam lines */}
                  <svg viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <path d="M5 60 Q60 45 115 60" stroke="rgba(0,0,0,0.5)" strokeWidth="2.5" fill="none" />
                    <path d="M5 60 Q60 75 115 60" stroke="rgba(0,0,0,0.5)" strokeWidth="2.5" fill="none" />
                    <line x1="60" y1="3" x2="60" y2="117" stroke="rgba(0,0,0,0.5)" strokeWidth="2.5" />
                    <path d="M25 12 Q40 30 30 60" stroke="rgba(0,0,0,0.35)" strokeWidth="1.8" fill="none" />
                    <path d="M95 12 Q80 30 90 60" stroke="rgba(0,0,0,0.35)" strokeWidth="1.8" fill="none" />
                    <path d="M25 108 Q40 90 30 60" stroke="rgba(0,0,0,0.35)" strokeWidth="1.8" fill="none" />
                    <path d="M95 108 Q80 90 90 60" stroke="rgba(0,0,0,0.35)" strokeWidth="1.8" fill="none" />
                    {/* Additional texture details */}
                    <circle cx="35" cy="35" r="3" fill="rgba(0,0,0,0.15)" />
                    <circle cx="85" cy="35" r="3" fill="rgba(0,0,0,0.15)" />
                    <circle cx="35" cy="85" r="3" fill="rgba(0,0,0,0.15)" />
                    <circle cx="85" cy="85" r="3" fill="rgba(0,0,0,0.15)" />
                  </svg>
                  {/* Enhanced highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 15,
                    left: 20,
                    width: 35,
                    height: 25,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.22)',
                    filter: 'blur(8px)',
                  }} />
                  {/* Secondary highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 25,
                    left: 45,
                    width: 20,
                    height: 15,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                    filter: 'blur(4px)',
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
                repeat: isLoading ? Infinity : 0,
              }}
              style={{
                position: 'absolute',
                bottom: 15,
                width: 140,
                height: 28,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0.2) 40%, transparent 70%)',
                filter: 'blur(10px)',
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
                repeat: isLoading ? Infinity : 0,
              }}
              style={{
                width: 120,
                height: 20,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, rgba(249,115,22,0.15) 40%, transparent 70%)',
                filter: 'blur(6px)',
                marginBottom: 8,
              }}
            />

            {/* Loading indicator when in loading state */}
            {isLoading && (
              <div style={{
                position: 'absolute',
                bottom: 60,
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                Loading Video...
              </div>
            )}

            {/* Basketball jumping text synced with ball animation */}
            {!isLoading && (
              <motion.div
                animate={{
                  y: [0, -180, 0, -100, 0, -45, 0, -16, 0],
                  opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 2.0,
                  times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  top: 80,
                  color: '#fb923c',
                  fontSize: '28px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textShadow: '0 4px 12px rgba(249,115,22,0.4)',
                  textAlign: 'center',
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 0.95, 1.05, 0.98, 1.02, 0.99, 1.01, 1],
                    rotate: [0, -5, 3, -2, 1, -1, 0.5, -0.5, 0],
                  }}
                  transition={{
                    duration: 2.0,
                    times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                    ease: 'easeInOut',
                  }}
                >
                  DUNK
                </motion.div>
              </motion.div>
            )}

            {/* Secondary jumping text */}
            {!isLoading && (
              <motion.div
                animate={{
                  y: [0, -180, 0, -100, 0, -45, 0, -16, 0],
                  opacity: [0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0],
                }}
                transition={{
                  duration: 2.0,
                  times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  top: 120,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '16px',
                  fontWeight: '500',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  textShadow: '0 2px 8px rgba(255,255,255,0.3)',
                  textAlign: 'center',
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 0.98, 1.02, 0.99, 1.01, 1, 1, 1],
                  }}
                  transition={{
                    duration: 2.0,
                    times: [0, 0.1, 0.25, 0.33, 0.48, 0.55, 0.7, 0.78, 1],
                    ease: 'easeInOut',
                  }}
                >
                  Basketball NFC
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
