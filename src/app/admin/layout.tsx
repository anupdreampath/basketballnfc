import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950" style={{ overflow: 'auto' }}>
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  )
}
