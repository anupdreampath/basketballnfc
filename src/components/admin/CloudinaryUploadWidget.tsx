'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import type { DeviceType } from '@/types'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/constants'

interface CloudinaryResult {
  public_id: string
  secure_url: string
  duration?: number
  bytes?: number
  thumbnail_url?: string
}

interface Props {
  deviceType: DeviceType
  onSuccess: (result: CloudinaryResult) => void
  disabled?: boolean
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cloudinary: any
  }
}

export default function CloudinaryUploadWidget({ deviceType, onSuccess, disabled }: Props) {
  const widgetRef = useRef<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Destroy widget when device type changes so a fresh one is created
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.destroy()
      widgetRef.current = null
    }
  }, [deviceType])

  function openWidget() {
    if (!scriptLoaded || !window.cloudinary) return

    // Re-use existing widget or create a fresh one
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          folder: `nfc_brand/${deviceType}`,
          resourceType: 'video',
          sources: ['local', 'url'],
          multiple: false,
          clientAllowedFormats: ['mp4', 'mov', 'webm', 'avi'],
          maxFileSize: 500_000_000,
          styles: {
            palette: {
              window: '#111111',
              windowBorder: '#333333',
              tabIcon: '#F97316',
              menuIcons: '#CCCCCC',
              textDark: '#FFFFFF',
              textLight: '#888888',
              link: '#F97316',
              action: '#F97316',
              inactiveTabIcon: '#666666',
              error: '#EF4444',
              inProgress: '#F97316',
              complete: '#22C55E',
              sourceBg: '#1A1A1A',
            },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error: any, result: any) => {
          if (error) {
            console.error('Upload widget error:', error)
            setUploading(false)
            return
          }
          if (result.event === 'success') {
            setUploading(false)
            onSuccess({
              public_id: result.info.public_id,
              secure_url: result.info.secure_url,
              duration: result.info.duration,
              bytes: result.info.bytes,
              thumbnail_url: result.info.thumbnail_url,
            })
          }
          if (result.event === 'close') {
            setUploading(false)
          }
        }
      )
    }

    setUploading(true)
    widgetRef.current.open()
  }

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <button
        onClick={openWidget}
        disabled={disabled || !scriptLoaded}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Uploading…' : `Upload ${deviceType} video`}
      </button>
    </>
  )
}
