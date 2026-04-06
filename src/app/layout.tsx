import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['900'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'NFC Brand Experience',
  description: 'Scan to experience.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body style={{ margin: 0, padding: 0, background: '#000' }}>{children}</body>
    </html>
  )
}
