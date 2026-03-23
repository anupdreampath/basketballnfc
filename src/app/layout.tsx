import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NFC Brand Experience',
  description: 'Scan to experience.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#000' }}>{children}</body>
    </html>
  )
}
