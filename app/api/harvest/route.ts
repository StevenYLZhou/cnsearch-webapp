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
      .maybeSingle()
    return !!adminRow
  } catch {
    return false
  }
}

async function proxyTo(endpoint: string, method: string, body?: string, timeoutMs = 15000) {
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
    signal: AbortSignal.timeout(timeoutMs),
  })
}

export async function GET(_request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await proxyTo('/harvest/status', 'GET')
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Research backend unreachable: ${err.message}` },
      { status: 502 }
    )
  }
}

export async function POST(_request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 45s timeout — harvest start creates 3 sessions + sends messages to Anthropic API
    const res = await proxyTo('/harvest', 'POST', '{}', 45000)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Research backend unreachable: ${err.message}` },
      { status: 502 }
    )
  }
}
