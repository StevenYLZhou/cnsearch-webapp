import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single()
  return !!data
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!await isAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { sources, ...caseData } = body
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: inserted, error } = await admin
    .from('cases')
    .insert({ ...caseData, created_by: user!.id, updated_by: user!.id })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (sources?.length) {
    const { error: srcErr } = await admin
      .from('case_sources')
      .insert(sources.map((s: any) => ({ ...s, case_id: inserted.id })))
    if (srcErr) return NextResponse.json({ error: srcErr.message }, { status: 400 })
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 })
}
