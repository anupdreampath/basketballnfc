import { headers } from 'next/headers'
import { detectDeviceFromUA } from '@/lib/constants'
import VideoPlayer from '@/components/public/VideoPlayer'

export default async function HomePage() {
  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const defaultDeviceType = detectDeviceFromUA(ua)

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <VideoPlayer defaultDeviceType={defaultDeviceType} />
    </main>
  )
}
