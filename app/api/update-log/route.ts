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

  const { notes } = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('update_log')
    .insert({
      refresh_date: new Date().toISOString().slice(0, 10),
      refreshed_by: user!.id,
      notes: notes ?? null,
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { ok } = await isAdmin(supabase)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, records_added, records_modified, records_removed } = await request.json()
  const admin = createAdminClient()

  const { error } = await admin
    .from('update_log')
    .update({ status: 'completed', records_added, records_modified, records_removed })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
