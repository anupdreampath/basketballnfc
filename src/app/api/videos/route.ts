import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const device = searchParams.get('device')
  const move = searchParams.get('move')
  const difficulty = searchParams.get('difficulty')

  const supabase = createServiceClient()
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false })

  if (device) query = query.eq('device_type', device)
  if (move) query = query.eq('move_name', move)
  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, move_name, difficulty, device_type, cloudinary_id, cloudinary_url, thumbnail_url, duration_secs, file_size_mb } = body

  if (!title || !move_name || !difficulty || !device_type || !cloudinary_id || !cloudinary_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('videos')
    .upsert(
      { title, move_name, difficulty, device_type, cloudinary_id, cloudinary_url, thumbnail_url, duration_secs, file_size_mb },
      { onConflict: 'move_name,difficulty,device_type' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
