import { createClient } from '@/lib/supabase/server'
import NewRefreshCycle from '@/components/NewRefreshCycle'

export default async function UpdateLogPage() {
  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('update_log')
    .select('*')
    .order('created_at', { ascending: false })

  const hasOpenCycle = logs?.some((l: any) => l.status === 'in_progress')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Update Log</h1>
        {!hasOpenCycle && <NewRefreshCycle />}
      </div>

      {hasOpenCycle && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          A refresh cycle is in progress. Add/edit cases, then mark it complete below.
        </div>
      )}

      {(!logs || logs.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No update cycles yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Modified</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{log.refresh_date}</td>
                  <td className="px-4 py-3 text-gray-600">+{log.records_added}</td>
                  <td className="px-4 py-3 text-gray-600">~{log.records_modified}</td>
                  <td className="px-4 py-3 text-gray-500">{log.notes ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {log.status}
                    </span>
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
