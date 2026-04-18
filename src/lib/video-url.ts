export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /shorts\/([a-zA-Z0-9_-]+)/,
    /embed\/([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function getVimeoVideoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

export function toEmbedUrl(url: string): string {
  if (/youtube\.com|youtu\.be/.test(url)) {
    const id = getYouTubeVideoId(url)
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&playsinline=1&rel=0`
  }
  if (/vimeo\.com/.test(url)) {
    const id = getVimeoVideoId(url)
    if (id) return `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&playsinline=1`
  }
  return url
}

export function isEmbedUrl(url: string): boolean {
  return url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')
}

export function getExternalThumbnail(url: string): string | null {
  if (/youtube\.com|youtu\.be/.test(url)) {
    const id = getYouTubeVideoId(url)
    if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
  }
  return null
}
