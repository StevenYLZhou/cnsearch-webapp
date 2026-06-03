import { createClient } from '@/lib/supabase/server'
import { OUTCOME_COLORS, PHASE_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import CaseFilters from '@/components/CaseFilters'
import Link from 'next/link'
import type { Case } from '@/lib/types'

export const revalidate = 300

type CaseListRow = Omit<Case, 'case_sources'> & {
  case_sources: Array<{ source_tier: number }>
}

const CONFIDENCE_COLORS: Record<string, string> = {
  High:   'bg-green-50 text-green-700',
  Medium: 'bg-yellow-50 text-yellow-700',
  Low:    'bg-red-50 text-red-700',
}

interface SearchParams {
  phase?: string
  dispute_type?: string
  outcome?: string
  industry?: string
  tariff_basis?: string
  status?: string
  search?: string
}

async function getCases(filters: SearchParams): Promise<CaseListRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('cases')
    .select('*, case_sources(source_tier)')
    .eq('is_published', true)
    .order('date_filed', { ascending: false, nullsFirst: false })

  if (filters.phase) query = query.eq('phase', parseInt(filters.phase))
  if (filters.dispute_type) query = query.eq('dispute_type', filters.dispute_type)
  if (filters.outcome) query = query.eq('outcome', filters.outcome)
  if (filters.industry) query = query.ilike('industry', `%${filters.industry}%`)
  if (filters.tariff_basis) query = query.contains('tariff_basis', [filters.tariff_basis])
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.search) query = query.textSearch('fts', filters.search, { type: 'websearch' })

  const { data } = await query
  return (data ?? []) as unknown as CaseListRow[]
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const cases: CaseListRow[] = await getCases(params)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Database</h1>
          <p className="text-sm text-gray-500 mt-1">{cases.length} case{cases.length !== 1 ? 's' : ''} found</p>
        </div>
        <a
          href="/api/export?format=csv"
          className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg"
        >
          Export CSV
        </a>
      </div>

      <CaseFilters />

      {cases.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No cases match the current filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Case</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phase</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Venue</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Sources</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.map((c) => {
                const tier1Count = (c.case_sources ?? []).filter(s => s.source_tier === 1).length
                const tier1Label = tier1Count >= 2 ? 'sufficient' : tier1Count === 1 ? 'limited' : 'insufficient'
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`} className="hover:text-blue-600 transition-colors">
                      <div className="font-medium text-gray-900 line-clamp-1">{c.case_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.case_code}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.phase === 1 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      P{c.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{c.dispute_type}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{c.venue ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.outcome ? (
                      <Badge className={`text-xs ${OUTCOME_COLORS[c.outcome] ?? ''}`}>
                        {c.outcome}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex gap-1.5 items-center">
                      <span
                        aria-label={`${tier1Count} Tier-1 sources — ${tier1Label}`}
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${tier1Count >= 2 ? 'bg-green-50 text-green-700' : tier1Count === 1 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}
                      >
                        {tier1Count} Tier-1
                      </span>
                      <span
                        aria-label={`Confidence: ${c.confidence_level ?? 'unknown'}`}
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${CONFIDENCE_COLORS[c.confidence_level] ?? ''}`}
                      >
                        {c.confidence_level ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {c.date_filed ? c.date_filed.slice(0, 7) : '—'}
                  </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
