'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/admin/videos', label: 'Videos', icon: '🎬' },
  { href: '/admin/schedule', label: 'Schedule', icon: '📅' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-sm">🏀</div>
          <span className="text-white font-bold text-sm tracking-wide">Admin</span>
        </div>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="text-gray-500 hover:text-white text-sm transition-colors"
      >
        Sign out
      </button>
    </nav>
  )
}
