import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET — check if any admin users exist
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ hasAdmin: data.users.length > 0 })
}

// POST — create the first admin user (only allowed if no users exist)
export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  // Guard: refuse if a user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  if (existing && existing.users.length > 0) {
    return NextResponse.json(
      { error: 'Admin already configured. Go to /admin/login.' },
      { status: 403 }
    )
  }

  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so they can log in immediately
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, userId: data.user.id })
}
