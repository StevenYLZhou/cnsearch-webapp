import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OUTCOME_COLORS, PHASE_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

function safeUrl(url: string | null | undefined): string {
  if (!url) return '#'
  return url.startsWith('http://') || url.startsWith('https://') ? url : '#'
}

export default async function AdminCasePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: c } = await supabase
    .from('cases')
    .select('*, case_sources(*)')
    .eq('id', id)
    .single()

  if (!c) notFound()

  const tier1Sources = (c.case_sources ?? []).filter((s: any) => s.source_tier === 1)
  const otherSources = (c.case_sources ?? []).filter((s: any) => s.source_tier > 1)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/admin/cases" className="hover:text-blue-600">Cases</Link>
          <span>/</span>
          <span className="text-gray-700">{c.case_code}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {c.is_published ? 'Published' : 'Draft — not visible to public'}
          </span>
          <Link
            href={`/admin/cases/${id}/edit`}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{c.case_name}</h1>
            <p className="text-sm text-gray-500 mt-1">{c.case_code}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PHASE_LABELS[c.phase] && (
              <Badge className={c.phase === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                {PHASE_LABELS[c.phase]}
              </Badge>
            )}
            {c.outcome && (
              <Badge className={OUTCOME_COLORS[c.outcome] ?? ''}>{c.outcome}</Badge>
            )}
            {c.status && (
              <Badge className="bg-gray-100 text-gray-700">{c.status}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
          {[
            { label: 'Dispute Type',  value: c.dispute_type },
            { label: 'Venue',         value: c.venue ? `${c.venue}${c.venue_detail ? ' — ' + c.venue_detail : ''}` : '—' },
            { label: 'Filed',         value: c.date_filed ?? '—' },
            { label: 'Decided',       value: c.date_decided ?? '—' },
            { label: 'Industry',      value: c.industry ?? '—' },
            { label: 'Tariff Basis',  value: c.tariff_basis?.join(', ') || '—' },
            { label: 'Confidence',    value: c.confidence_level },
            { label: 'Data As Of',    value: c.freeze_date },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-sm text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parties */}
      {(c.chinese_party_name || c.us_party_name) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Parties</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {c.chinese_party_name && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Chinese Party</p>
                <p className="font-medium text-gray-900">{c.chinese_party_name}</p>
                {c.chinese_party_type && <p className="text-sm text-gray-500">{c.chinese_party_type}</p>}
              </div>
            )}
            {c.us_party_name && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">US Party</p>
                <p className="font-medium text-gray-900">{c.us_party_name}</p>
                {c.us_party_type && <p className="text-sm text-gray-500">{c.us_party_type}</p>}
              </div>
            )}
          </div>
          {c.dispute_subject && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Dispute Subject</p>
              <p className="text-sm text-gray-800">{c.dispute_subject}</p>
            </div>
          )}
        </div>
      )}

      {/* Key legal issues */}
      {c.key_legal_issues?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Key Legal Issues</h2>
          <div className="flex flex-wrap gap-2">
            {c.key_legal_issues.map((issue: string) => (
              <Badge key={issue} className="bg-purple-50 text-purple-800">{issue}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Key ruling */}
      {c.key_ruling && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Key Ruling / Holding</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.key_ruling}</p>
        </div>
      )}

      {/* Key takeaways */}
      {c.key_takeaways && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h2 className="font-semibold text-amber-900 mb-3">Key Takeaways for Researchers</h2>
          <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{c.key_takeaways}</p>
        </div>
      )}

      {/* Sources */}
      {c.case_sources?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Sources ({c.case_sources.length})</h2>

          {tier1Sources.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tier 1 — Primary Documents</p>
              <ul className="space-y-3">
                {tier1Sources.map((s: any) => (
                  <li key={s.id} className="flex items-start gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded mt-0.5 shrink-0">{s.source_type ?? 'Primary'}</span>
                    <div className="min-w-0">
                      <a href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-words">
                        {s.title ?? s.url}
                      </a>
                      <p className="text-xs text-gray-400 mt-0.5 break-all">{s.url}</p>
                      {s.accessed_date && <p className="text-xs text-gray-400">Accessed: {s.accessed_date}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {otherSources.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Supporting Sources</p>
              <ul className="space-y-3">
                {otherSources.map((s: any) => (
                  <li key={s.id} className="flex items-start gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-0.5 shrink-0">T{s.source_tier}</span>
                    <div className="min-w-0">
                      <a href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-words">
                        {s.title ?? s.url}
                      </a>
                      <p className="text-xs text-gray-400 mt-0.5 break-all">{s.url}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        Data frozen as of {c.freeze_date}.
      </p>
    </div>
  )
}
