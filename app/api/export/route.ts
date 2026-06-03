import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phase = searchParams.get('phase')
  const format = searchParams.get('format') ?? 'csv'

  const supabase = await createClient()
  let query = supabase
    .from('cases')
    .select('*, case_sources(url, source_type, source_tier, title)')
    .eq('is_published', true)
    .order('date_filed', { ascending: false, nullsFirst: false })

  if (phase) query = query.eq('phase', parseInt(phase))

  const { data: cases, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (cases ?? []).map((c: any) => ({
    case_code: c.case_code,
    case_name: c.case_name,
    phase: c.phase,
    status: c.status ?? '',
    venue: c.venue ?? '',
    venue_detail: c.venue_detail ?? '',
    dispute_type: c.dispute_type,
    tariff_basis: c.tariff_basis?.join('; ') ?? '',
    industry: c.industry ?? '',
    chinese_party: c.chinese_party_name ?? '',
    chinese_party_type: c.chinese_party_type ?? '',
    us_party: c.us_party_name ?? '',
    us_party_type: c.us_party_type ?? '',
    dispute_subject: c.dispute_subject ?? '',
    key_legal_issues: c.key_legal_issues?.join('; ') ?? '',
    outcome: c.outcome ?? '',
    key_ruling: c.key_ruling ?? '',
    key_takeaways: c.key_takeaways ?? '',
    confidence_level: c.confidence_level,
    date_filed: c.date_filed ?? '',
    date_decided: c.date_decided ?? '',
    freeze_date: c.freeze_date,
    tier1_sources: c.case_sources
      ?.filter((s: any) => s.source_tier === 1)
      .map((s: any) => s.url)
      .join(' | ') ?? '',
    all_sources: c.case_sources?.map((s: any) => s.url).join(' | ') ?? '',
  }))

  if (format === 'csv') {
    const headers = Object.keys(rows[0] ?? {})
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape((r as any)[h])).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tariff-disputes-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    })
  }

  return NextResponse.json(rows)
}
