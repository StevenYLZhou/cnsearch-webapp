'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  VENUES, DISPUTE_TYPES, OUTCOMES, STATUSES,
  PARTY_TYPES, CONFIDENCE_LEVELS, TARIFF_BASIS_OPTIONS, INDUSTRIES
} from '@/lib/constants'
import type { CaseWithSources } from '@/lib/types'

interface Source {
  id?: string
  url: string
  source_type: string
  source_tier: number
  title: string
  accessed_date: string
}

interface Props {
  initialData?: CaseWithSources
  mode: 'create' | 'edit'
}

const emptySource = (): Source => ({ url: '', source_type: 'PACER', source_tier: 1, title: '', accessed_date: '' })

const SOURCE_TYPES = ['PACER','USCIT','CAFC','WTO','Law Review','News','Firm Alert','Think Tank','Other']

export default function CaseForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [sources, setSources] = useState<Source[]>(
    initialData?.case_sources?.length
      ? initialData.case_sources.map(s => ({
          id: s.id, url: s.url, source_type: s.source_type ?? 'Other',
          source_tier: s.source_tier, title: s.title ?? '', accessed_date: s.accessed_date ?? '',
        }))
      : [emptySource(), emptySource()]
  )
  const [tariffBasis, setTariffBasis] = useState<string[]>(initialData?.tariff_basis ?? [])
  const [legalIssues, setLegalIssues] = useState(initialData?.key_legal_issues?.join(', ') ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true)

  const tier1Count = sources.filter(s => s.source_tier === 1 && s.url.trim()).length

  function addSource() {
    setSources(prev => [...prev, emptySource()])
  }

  function removeSource(i: number) {
    setSources(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateSource(i: number, field: keyof Source, value: string | number) {
    setSources(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function toggleTariffBasis(val: string) {
    setTariffBasis(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (tier1Count < 2) {
      toast.error('At least 2 Tier-1 sources are required before saving.')
      return
    }
    setSaving(true)

    const form = e.currentTarget
    const fd = new FormData(form)

    const payload = {
      case_code: fd.get('case_code') as string,
      case_name: fd.get('case_name') as string,
      phase: parseInt(fd.get('phase') as string),
      date_filed: fd.get('date_filed') || null,
      date_decided: fd.get('date_decided') || null,
      status: fd.get('status') || null,
      venue: fd.get('venue') || null,
      venue_detail: fd.get('venue_detail') || null,
      dispute_type: fd.get('dispute_type') as string,
      tariff_basis: tariffBasis,
      industry: fd.get('industry') || null,
      industry_subsector: fd.get('industry_subsector') || null,
      chinese_party_name: fd.get('chinese_party_name') || null,
      chinese_party_type: fd.get('chinese_party_type') || null,
      us_party_name: fd.get('us_party_name') || null,
      us_party_type: fd.get('us_party_type') || null,
      dispute_subject: fd.get('dispute_subject') || null,
      key_legal_issues: legalIssues.split(',').map(s => s.trim()).filter(Boolean),
      outcome: fd.get('outcome') || null,
      key_ruling: fd.get('key_ruling') || null,
      key_takeaways: fd.get('key_takeaways') || null,
      confidence_level: fd.get('confidence_level') as string,
      freeze_date: fd.get('freeze_date') as string,
      is_published: isPublished,
      sources: sources.filter(s => s.url.trim()),
    }

    const url = mode === 'create' ? '/api/cases' : `/api/cases/${initialData!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      toast.success(mode === 'create' ? 'Case created.' : 'Case updated.')
      router.push(`/admin/cases`)
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Failed to save case.')
      setSaving(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic info */}
      <Section title="Basic Information">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Case Code *" name="case_code" required placeholder="e.g. P2-IEEPA-0001" defaultValue={initialData?.case_code} />
          <Field label="Phase *" name="phase" required type="select" defaultValue={String(initialData?.phase ?? 2)}>
            <option value="1">Phase 1 (2018–2022)</option>
            <option value="2">Phase 2 (2025–present)</option>
          </Field>
        </div>
        <Field label="Case Name *" name="case_name" required defaultValue={initialData?.case_name} />
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Dispute Type *" name="dispute_type" required type="select" defaultValue={initialData?.dispute_type ?? 'Tariff Legality'}>
            {DISPUTE_TYPES.map(t => <option key={t}>{t}</option>)}
          </Field>
          <Field label="Status" name="status" type="select" defaultValue={initialData?.status ?? ''}>
            <option value="">— Select —</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </Field>
          <Field label="Outcome" name="outcome" type="select" defaultValue={initialData?.outcome ?? ''}>
            <option value="">— Select —</option>
            {OUTCOMES.map(o => <option key={o}>{o}</option>)}
          </Field>
        </div>
      </Section>

      {/* Venue & dates */}
      <Section title="Venue & Dates">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Venue" name="venue" type="select" defaultValue={initialData?.venue ?? ''}>
            <option value="">— Select —</option>
            {VENUES.map(v => <option key={v}>{v}</option>)}
          </Field>
          <Field label="Venue Detail" name="venue_detail" placeholder="e.g. S.D.N.Y." defaultValue={initialData?.venue_detail ?? ''} />
          <Field label="Industry" name="industry" type="select" defaultValue={initialData?.industry ?? ''}>
            <option value="">— Select —</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </Field>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Date Filed" name="date_filed" type="date" defaultValue={initialData?.date_filed ?? ''} />
          <Field label="Date Decided" name="date_decided" type="date" defaultValue={initialData?.date_decided ?? ''} />
          <Field label="Data Freeze Date *" name="freeze_date" type="date" required defaultValue={initialData?.freeze_date ?? today} />
        </div>
      </Section>

      {/* Parties */}
      <Section title="Parties">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Chinese Party Name" name="chinese_party_name" defaultValue={initialData?.chinese_party_name ?? ''} />
          <Field label="Chinese Party Type" name="chinese_party_type" type="select" defaultValue={initialData?.chinese_party_type ?? ''}>
            <option value="">— Select —</option>
            {PARTY_TYPES.map(t => <option key={t}>{t}</option>)}
          </Field>
          <Field label="US Party Name" name="us_party_name" defaultValue={initialData?.us_party_name ?? ''} />
          <Field label="US Party Type" name="us_party_type" type="select" defaultValue={initialData?.us_party_type ?? ''}>
            <option value="">— Select —</option>
            {PARTY_TYPES.map(t => <option key={t}>{t}</option>)}
          </Field>
        </div>
        <Field label="Dispute Subject" name="dispute_subject" placeholder="e.g. cost gap, force majeure, tariff refund" defaultValue={initialData?.dispute_subject ?? ''} />
      </Section>

      {/* Tariff basis */}
      <Section title="Tariff Basis (select all that apply)">
        <div className="flex flex-wrap gap-2">
          {TARIFF_BASIS_OPTIONS.map(t => (
            <button
              key={t} type="button"
              onClick={() => toggleTariffBasis(t)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                tariffBasis.includes(t)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      {/* Legal analysis */}
      <Section title="Legal Analysis">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Legal Issues <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={legalIssues}
            onChange={e => setLegalIssues(e.target.value)}
            placeholder="e.g. UCC 2-615, Force Majeure, IEEPA authority"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <Field label="Key Ruling / Holding" name="key_ruling" type="textarea" rows={4} defaultValue={initialData?.key_ruling ?? ''} />
        <Field label="Key Takeaways for Researchers" name="key_takeaways" type="textarea" rows={3} defaultValue={initialData?.key_takeaways ?? ''} />
      </Section>

      {/* Sources */}
      <Section title={`Sources (${tier1Count}/2 required Tier-1 sources)`}>
        {tier1Count < 2 && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            ⚠ You need at least 2 Tier-1 sources (PACER, USCIT, CAFC, WTO, or primary documents) before saving.
          </p>
        )}
        <div className="space-y-3">
          {sources.map((s, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Source {i + 1}</span>
                {sources.length > 2 && (
                  <button type="button" onClick={() => removeSource(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                )}
              </div>
              <input
                type="url"
                value={s.url}
                onChange={e => updateSource(i, 'url', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={s.source_type}
                  onChange={e => updateSource(i, 'source_type', e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                >
                  {SOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select
                  value={s.source_tier}
                  onChange={e => updateSource(i, 'source_tier', parseInt(e.target.value))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                >
                  <option value={1}>Tier 1 (Primary)</option>
                  <option value={2}>Tier 2 (Corroboration)</option>
                  <option value={3}>Tier 3 (Commentary)</option>
                </select>
                <input
                  type="date"
                  value={s.accessed_date}
                  onChange={e => updateSource(i, 'accessed_date', e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={s.title}
                onChange={e => updateSource(i, 'title', e.target.value)}
                placeholder="Source title / description"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addSource} className="text-sm text-blue-600 hover:text-blue-700">
          + Add another source
        </button>
      </Section>

      {/* Metadata */}
      <Section title="Record Metadata">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Confidence Level *" name="confidence_level" required type="select" defaultValue={initialData?.confidence_level ?? 'Medium'}>
            {CONFIDENCE_LEVELS.map(c => <option key={c}>{c}</option>)}
          </Field>
          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_published" className="text-sm text-gray-700">
              Published (visible to public)
            </label>
          </div>
        </div>
      </Section>

      {/* Submit */}
      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : mode === 'create' ? 'Create Case' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        {tier1Count < 2 && (
          <span className="text-xs text-red-500">Add {2 - tier1Count} more Tier-1 source(s) to save</span>
        )}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  required?: boolean
  type?: string
  placeholder?: string
  defaultValue?: string
  rows?: number
  children?: React.ReactNode
}

function Field({ label, name, required, type = 'text', placeholder, defaultValue, rows, children }: FieldProps) {
  const base = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} rows={rows ?? 3} defaultValue={defaultValue} placeholder={placeholder} className={base} />
      ) : type === 'select' ? (
        <select name={name} required={required} defaultValue={defaultValue} className={base}>
          {children}
        </select>
      ) : (
        <input type={type} name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} className={base} />
      )}
    </div>
  )
}
