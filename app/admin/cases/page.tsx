import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { OUTCOME_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { AnalyzeButton } from '@/components/AnalyzeButton'

export default async function AdminCasesPage() {
  const supabase = await createClient()
  const { data: cases } = await supabase
    .from('cases')
    .select('id, case_code, case_name, phase, dispute_type, outcome, status, is_published, analysis_status, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">All Cases</h1>
        <Link
          href="/admin/cases/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Case
        </Link>
      </div>

      {(!cases || cases.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No cases yet. <Link href="/admin/cases/new" className="text-blue-600 hover:underline">Add the first one.</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Case</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phase</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Visibility</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Analysis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.map((c: any) => (
                <tr key={c.id} className={`hover:bg-gray-50 ${!c.is_published ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{c.case_name}</div>
                    <div className="text-xs text-gray-400">{c.case_code}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.phase === 1 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      P{c.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{c.status ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.outcome ? (
                      <Badge className={`text-xs ${OUTCOME_COLORS[c.outcome] ?? ''}`}>{c.outcome}</Badge>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <AnalyzeButton caseId={c.id} initialStatus={c.analysis_status ?? 'pending'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/cases/${c.id}`} className="text-gray-700 hover:text-gray-900 text-xs font-medium">Preview</Link>
                      <Link href={`/admin/cases/${c.id}/edit`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
