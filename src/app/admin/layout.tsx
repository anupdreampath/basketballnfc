import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-950" style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  )
}
