import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('starts_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { move_name, starts_at, ends_at, label, difficulty } = body

  if (!move_name || !starts_at || !ends_at) {
    return NextResponse.json({ error: 'Missing required fields: move_name, starts_at, ends_at' }, { status: 400 })
  }

  if (new Date(ends_at) <= new Date(starts_at)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('schedules')
    .insert({ move_name, starts_at, ends_at, label: label || null, difficulty: difficulty || null, video_id: null, device_type: 'desktop' })
    .select()
    .single()

  if (error) {
    if (error.code === '23P01') {
      return NextResponse.json({ error: 'This time slot overlaps with an existing schedule.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
