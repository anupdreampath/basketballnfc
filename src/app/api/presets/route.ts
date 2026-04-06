import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, ...rest } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // Null out empty strings
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

    const { data, error } = await supabase.from('presets').insert([row]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
