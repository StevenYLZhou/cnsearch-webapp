'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  p1: { outcome: string; dispute_type: string }[]
  p2: { outcome: string; dispute_type: string }[]
  p1Outcomes: Record<string, number>
  p2Outcomes: Record<string, number>
  p1Disputes: Record<string, number>
  p2Disputes: Record<string, number>
}

export default function PhaseComparisonChart({ p1Outcomes, p2Outcomes, p1Disputes, p2Disputes }: Props) {
  const allOutcomes = Array.from(new Set([...Object.keys(p1Outcomes), ...Object.keys(p2Outcomes)]))
  const allDisputes = Array.from(new Set([...Object.keys(p1Disputes), ...Object.keys(p2Disputes)]))

  const outcomeData = allOutcomes.map(o => ({
    name: o.replace(' Party', '').replace(' Won', ' ✓'),
    'Phase 1': p1Outcomes[o] ?? 0,
    'Phase 2': p2Outcomes[o] ?? 0,
  }))

  const disputeData = allDisputes.map(d => ({
    name: d === 'Commercial Contract' ? 'Commercial' : d === 'Tariff Legality' ? 'Legality' : d,
    'Phase 1': p1Disputes[d] ?? 0,
    'Phase 2': p2Disputes[d] ?? 0,
  }))

  if (outcomeData.length === 0 && disputeData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
        Charts will appear once case records are added.
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Outcomes by Phase</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={outcomeData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Phase 1" fill="#3b82f6" radius={[3,3,0,0]} />
            <Bar dataKey="Phase 2" fill="#ef4444" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Dispute Types by Phase</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={disputeData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Phase 1" fill="#3b82f6" radius={[3,3,0,0]} />
            <Bar dataKey="Phase 2" fill="#ef4444" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
