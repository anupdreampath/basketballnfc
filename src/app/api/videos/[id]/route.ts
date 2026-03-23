import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import cloudinary from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAuth = await createServerSupabaseClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('videos')
    .update(body)
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAuth = await createServerSupabaseClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get video to retrieve cloudinary_id
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('cloudinary_id')
    .eq('id', params.id)
    .single()

  if (fetchError || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(video.cloudinary_id, { resource_type: 'video' })
  } catch (e) {
    console.error('Cloudinary delete error:', e)
    // Continue with DB deletion even if Cloudinary fails
  }

  // Delete from database (cascades to schedules)
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', params.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
