import VideoLibrary from '@/components/admin/VideoLibrary'

export default function VideosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Videos</h1>
        <p className="text-gray-500 text-sm mt-1">Upload and manage videos for each device type.</p>
      </div>
      <VideoLibrary />
    </div>
  )
}
