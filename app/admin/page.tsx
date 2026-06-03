import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: total }, { count: pending }, { count: phase1 }, { count: phase2 }, { data: recentLog }] =
    await Promise.all([
      supabase.from('cases').select('*', { count: 'exact', head: true }),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('phase', 1),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('phase', 2),
      supabase.from('update_log').select('*').order('created_at', { ascending: false }).limit(3),
    ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          href="/admin/cases/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Case
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: total ?? 0 },
          { label: 'Phase 1', value: phase1 ?? 0 },
          { label: 'Phase 2', value: phase2 ?? 0 },
          { label: 'Pending Outcome', value: pending ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: '/admin/cases', label: 'Manage Cases', desc: 'Add, edit, or archive case records' },
          { href: '/admin/update-log', label: 'Update Log', desc: 'Track refresh cycles and changes' },
          { href: '/api/export?format=csv', label: 'Export CSV', desc: 'Download all published cases' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-colors">
            <p className="font-medium text-gray-900">{a.label}</p>
            <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent update log */}
      {recentLog && recentLog.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Recent Updates</h2>
          <div className="space-y-2">
            {recentLog.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="font-medium text-gray-800">{log.refresh_date}</span>
                  {log.notes && <span className="text-gray-500 ml-2">— {log.notes}</span>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
