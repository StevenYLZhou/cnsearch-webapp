import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DO_URL = process.env.DO_RESEARCH_URL
const DO_SECRET = process.env.DO_RESEARCH_SECRET

async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single()
    return !!adminRow
  } catch {
    return false
  }
}

async function proxyTo(endpoint: string, method: string, body?: string) {
  if (!DO_URL || !DO_SECRET) {
    throw new Error('Research backend not configured — DO_RESEARCH_URL or DO_RESEARCH_SECRET env var missing')
  }
  return fetch(`${DO_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Research-Secret': DO_SECRET,
    },
    ...(body ? { body } : {}),
    signal: AbortSignal.timeout(15000),
  })
}

export async function GET(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const action = new URL(request.url).searchParams.get('action')
  const endpoint =
    action === 'seed-status'    ? '/seed/status'    :
    action === 'refresh-status' ? '/refresh/status' :
    action === 'test-status'    ? '/test/status'    :
    '/health'

  try {
    const res = await proxyTo(endpoint, 'GET')
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Research backend unreachable: ${err.message}` },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const action = new URL(request.url).searchParams.get('action')
  const endpoint =
    action === 'seed'    ? '/seed'    :
    action === 'refresh' ? '/refresh' :
    action === 'test'    ? '/test'    :
    null

  if (!endpoint) return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  try {
    const body = await request.text()
    const res = await proxyTo(endpoint, 'POST', body || '{}')
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Research backend unreachable: ${err.message}` },
      { status: 502 }
    )
  }
}
