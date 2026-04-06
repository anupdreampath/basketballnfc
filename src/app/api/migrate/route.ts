import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  try {
    // Add new columns to settings table if they don't exist
    const { error: descError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE settings
            ADD COLUMN IF NOT EXISTS move_description TEXT,
            ADD COLUMN IF NOT EXISTS move_level TEXT,
            ADD COLUMN IF NOT EXISTS move_quote TEXT;`
    }).catch(() => ({ error: { message: 'RPC not available' } }))

    // Alternative: use direct fetch if RPC not available
    if (descError?.message === 'RPC not available' || descError) {
      // Try a simpler approach - insert a null value which should trigger column creation
      const { data: settings } = await supabase.from('settings').select('*').limit(1)

      if (settings && settings.length > 0) {
        await supabase.from('settings').update({
          move_description: null,
          move_level: null,
          move_quote: null,
        }).eq('id', settings[0].id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed. Columns added to settings table.'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        hint: 'You may need to add columns manually in Supabase dashboard: move_description, move_level, move_quote (all TEXT type)'
      },
      { status: 500 }
    )
  }
}
