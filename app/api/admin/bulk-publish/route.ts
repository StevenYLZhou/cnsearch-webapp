import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, user: null }
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single()
  return { ok: !!data, user }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { ok, user } = await isAdmin(supabase)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('cases')
    .update({ is_published: true, updated_by: user!.id })
    .eq('analysis_status', 'done')
    .eq('is_published', false)
    .select('id')

  if (error) {
    console.error('[bulk-publish]', error.message)
    return NextResponse.json({ error: 'Failed to publish cases.' }, { status: 500 })
  }

  return NextResponse.json({ published: data?.length ?? 0 })
}
