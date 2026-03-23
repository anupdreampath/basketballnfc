// Client-safe Cloudinary URL helpers — no server SDK import

export function getOptimizedVideoUrl(cloudinaryId: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloud}/video/upload/${cloudinaryId}.mp4`
}

// Derive a thumbnail from a stored video URL (preserves the version number)
// Input:  https://res.cloudinary.com/cloud/video/upload/v123/nfc_brand/x.mp4
// Output: https://res.cloudinary.com/cloud/video/upload/c_thumb,w_640/v123/nfc_brand/x.jpg
export function getThumbnailFromVideoUrl(videoUrl: string): string {
  return videoUrl
    .replace('/video/upload/', '/video/upload/c_thumb,w_640/')
    .replace(/\.mp4$/, '.jpg')
}

export function getThumbnailUrl(cloudinaryId: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloud}/video/upload/so_0,f_jpg,w_640/${cloudinaryId}.jpg`
}
