import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { name, ...rest } = body

    const row: Record<string, any> = { name }
    const fields = [
      'override_move_name', 'default_difficulty', 'front_page_title',
      'move_description', 'move_level', 'move_quote',
      'slot_beginner_mobile_id', 'slot_beginner_tablet_id', 'slot_beginner_desktop_id',
      'slot_intermediate_mobile_id', 'slot_intermediate_tablet_id', 'slot_intermediate_desktop_id',
      'slot_pro_mobile_id', 'slot_pro_tablet_id', 'slot_pro_desktop_id',
    ]
    for (const f of fields) {
      row[f] = rest[f] || null
    }

    const { data, error } = await supabase.from('presets').update(row).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase.from('presets').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
