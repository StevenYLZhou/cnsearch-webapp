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

// GET /api/analyze?caseId=<uuid>  →  returns analysis status for that case
export async function GET(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caseId = request.nextUrl.searchParams.get('caseId')
  if (!caseId) return NextResponse.json({ error: 'caseId query param required' }, { status: 400 })

  try {
    const res = await proxyTo(`/analyze/status/${encodeURIComponent(caseId)}`, 'GET')
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Research backend unreachable: ${err.message}` },
      { status: 502 }
    )
  }
}

// POST /api/analyze
//   body { caseId: string }        →  single-case analysis
//   body { caseIds: string[] }     →  batch analysis
export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    if (Array.isArray(body?.caseIds)) {
      // 45s timeout — batch analyze starts multiple Anthropic sessions
      const res = await proxyTo('/analyze/batch', 'POST', JSON.stringify({ caseIds: body.caseIds }), 45000)
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    if (typeof body?.caseId === 'string') {
      // 45s timeout — analyze start creates Anthropic session
      const res = await proxyTo(`/analyze/${encodeURIComponent(body.caseId)}`, 'POST', '{}', 45000)
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ error: 'Body must contain caseId (string) or caseIds (array)' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Research backend unreachable: ${err.message}` },
      { status: 502 }
    )
  }
}
