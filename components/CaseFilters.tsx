'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { VENUES, DISPUTE_TYPES, OUTCOMES, STATUSES, TARIFF_BASIS_OPTIONS, INDUSTRIES } from '@/lib/constants'

export default function CaseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/cases?${params.toString()}`)
  }, [router, searchParams])

  const clear = () => router.push('/cases')

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Filter Cases</span>
        {hasFilters && (
          <button onClick={clear} className="text-xs text-red-500 hover:text-red-700">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Search..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => update('search', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm col-span-2 md:col-span-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <select
          value={searchParams.get('phase') ?? ''}
          onChange={e => update('phase', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Phases</option>
          <option value="1">Phase 1 (2018–2022)</option>
          <option value="2">Phase 2 (2025–present)</option>
        </select>

        <select
          value={searchParams.get('dispute_type') ?? ''}
          onChange={e => update('dispute_type', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Types</option>
          {DISPUTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={searchParams.get('outcome') ?? ''}
          onChange={e => update('outcome', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Outcomes</option>
          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <select
          value={searchParams.get('tariff_basis') ?? ''}
          onChange={e => update('tariff_basis', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Tariff Bases</option>
          {TARIFF_BASIS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={searchParams.get('status') ?? ''}
          onChange={e => update('status', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
