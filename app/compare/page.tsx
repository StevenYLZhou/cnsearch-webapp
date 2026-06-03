import { createClient } from '@/lib/supabase/server'
import PhaseComparisonChart from '@/components/PhaseComparisonChart'
import { PHASE_LABELS } from '@/lib/constants'
import Link from 'next/link'

export const revalidate = 300

async function getCompareData() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from('cases')
    .select('phase, outcome, dispute_type, tariff_basis, industry, status, date_filed, date_decided')
    .eq('is_published', true)

  const { data: narrative } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'compare_narrative')
    .single()

  return { cases: cases ?? [], narrative: narrative?.value ?? '' }
}

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
}

function daysBetween(a: string, b: string) {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000
}

export default async function ComparePage() {
  const { cases, narrative } = await getCompareData()

  const p1 = cases.filter(c => c.phase === 1)
  const p2 = cases.filter(c => c.phase === 2)

  function outcomeBreakdown(subset: typeof cases) {
    const counts: Record<string, number> = {}
    subset.forEach(c => { if (c.outcome) counts[c.outcome] = (counts[c.outcome] ?? 0) + 1 })
    return counts
  }

  function disputeBreakdown(subset: typeof cases) {
    const counts: Record<string, number> = {}
    subset.forEach(c => { counts[c.dispute_type] = (counts[c.dispute_type] ?? 0) + 1 })
    return counts
  }

  const p1Durations = p1
    .filter(c => c.date_filed && c.date_decided)
    .map(c => daysBetween(c.date_filed!, c.date_decided!))
  const p2Durations = p2
    .filter(c => c.date_filed && c.date_decided)
    .map(c => daysBetween(c.date_filed!, c.date_decided!))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phase 1 vs Phase 2 Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">
          Patterns and differences across the two waves of US–China trade war litigation
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Phase 1 Cases', p1: p1.length, p2: p2.length },
          { label: 'Decided / Settled',
            p1: p1.filter(c => c.outcome && !['Pending','Unknown'].includes(c.outcome)).length,
            p2: p2.filter(c => c.outcome && !['Pending','Unknown'].includes(c.outcome)).length },
          { label: 'Avg Days to Decision',
            p1: avg(p1Durations) ?? '—',
            p2: avg(p2Durations) ?? '—' },
          { label: 'Commercial Contract',
            p1: p1.filter(c => c.dispute_type !== 'Tariff Legality').length,
            p2: p2.filter(c => c.dispute_type !== 'Tariff Legality').length },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
            <div className="flex items-end gap-3">
              <div>
                <div className="text-xl font-bold text-blue-600">{stat.p1}</div>
                <div className="text-xs text-blue-400">Phase 1</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{stat.p2}</div>
                <div className="text-xs text-red-400">Phase 2</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <PhaseComparisonChart
        p1={p1 as any}
        p2={p2 as any}
        p1Outcomes={outcomeBreakdown(p1)}
        p2Outcomes={outcomeBreakdown(p2)}
        p1Disputes={disputeBreakdown(p1)}
        p2Disputes={disputeBreakdown(p2)}
      />

      {/* Narrative from admin */}
      {narrative && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Researcher Analysis</h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{narrative}</div>
        </div>
      )}

      {/* Cross-reference placeholder */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
        Cross-references between Phase 1 and Phase 2 cases will appear here as case records are added
        with linked <code>similar_case_ids</code>.
      </div>
    </div>
  )
}
