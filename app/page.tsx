import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'

export const revalidate = 300

async function getStats() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cases')
    .select('phase, outcome, dispute_type')
    .eq('is_published', true)
  return data ?? []
}

export default async function HomePage() {
  const cases = await getStats()
  const phase1 = cases.filter(c => c.phase === 1).length
  const phase2 = cases.filter(c => c.phase === 2).length
  const decided = cases.filter(c => c.outcome && c.outcome !== 'Pending' && c.outcome !== 'Unknown').length
  const commercial = cases.filter(c => c.dispute_type === 'Commercial Contract' || c.dispute_type === 'Both').length

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          US–China Tariff Dispute Database
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          An academic research database tracking legal disputes arising from the US–China trade war.
          Covers both Phase 1 (2018–2022) and Phase 2 (2025–present) — including commercial contract
          disputes and administrative challenges to tariff authority.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/cases"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Cases
          </Link>
          <Link
            href="/compare"
            className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Phase Comparison
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: cases.length, sub: 'in database' },
          { label: 'Phase 1', value: phase1, sub: '2018–2022' },
          { label: 'Phase 2', value: phase2, sub: '2025–present' },
          { label: 'Decided / Settled', value: decided, sub: 'with outcomes' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* What this database tracks */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Commercial Disputes</Badge>
          </div>
          <h3 className="font-semibold text-gray-900">Private Contract Disputes</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            When tariffs increase the cost of goods mid-contract, who pays the difference?
            Cases covering force majeure claims, UCC 2-615 impracticability, breach of contract,
            and renegotiation between Chinese and US commercial parties.
          </p>
          <p className="text-xs text-gray-400">
            Sources: PACER federal dockets, ICC/HKIAC arbitration awards, published settlements
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">Tariff Legality</Badge>
          </div>
          <h3 className="font-semibold text-gray-900">Administrative &amp; Constitutional Challenges</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Legal challenges to the authority behind the tariffs themselves — IEEPA constitutionality,
            Section 301 scope, WTO dispute settlement, and USCIT/CAFC rulings on tariff legality.
          </p>
          <p className="text-xs text-gray-400">
            Sources: USCIT docket, CAFC opinions, WTO Dispute Settlement Gateway
          </p>
        </div>
      </div>

      {/* Phase overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Two Phases of the Trade War</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span className="font-medium text-sm text-gray-800">Phase 1: 2018–2022</span>
            </div>
            <p className="text-sm text-gray-600 pl-4">
              Trump first term — Section 301 tariffs on Chinese goods, Section 232 steel and aluminum,
              followed by retaliatory tariffs and an initial trade deal (Phase One Agreement, Jan 2020).
              Many USCIT cases challenging tariff legality; some already decided.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <span className="font-medium text-sm text-gray-800">Phase 2: 2025–present</span>
            </div>
            <p className="text-sm text-gray-600 pl-4">
              Trump second term — sweeping new IEEPA tariffs, escalating Section 301 rates,
              Chinese retaliatory tariffs and export controls on critical minerals.
              Most cases still pending; IEEPA authority actively contested in courts.
            </p>
          </div>
        </div>
        <div className="pt-2">
          <Link
            href="/compare"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Phase 1 vs Phase 2 comparison →
          </Link>
        </div>
      </div>

      {/* Citation */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-sm text-gray-600 space-y-1">
        <p className="font-medium text-gray-700">Cite this database</p>
        <p>
          US–China Tariff Dispute Database (2026). University of San Francisco.
          Available at: [URL]. Data freeze date shown on each case record.
        </p>
      </div>
    </div>
  )
}
