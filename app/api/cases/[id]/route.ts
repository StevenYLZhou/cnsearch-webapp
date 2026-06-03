import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, user: null }
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single()
  return { ok: !!data, user }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { ok, user } = await isAdmin(supabase)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { sources, ...caseData } = body

  const admin = createAdminClient()

  const { error } = await admin
    .from('cases')
    .update({ ...caseData, updated_by: user!.id })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Replace sources if provided
  if (sources !== undefined) {
    await admin.from('case_sources').delete().eq('case_id', id)
    if (sources.length) {
      const { error: srcErr } = await admin
        .from('case_sources')
        .insert(sources.map((s: any) => ({ ...s, case_id: id })))
      if (srcErr) return NextResponse.json({ error: srcErr.message }, { status: 400 })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { ok } = await isAdmin(supabase)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.from('cases').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
