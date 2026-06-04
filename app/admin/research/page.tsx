'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SessionInfo {
  type: string
  status: string
  casesImported?: number
  startedAt?: number
  completedAt?: number
  lastError?: string
}

interface TestState {
  status: 'idle' | 'creating' | 'running' | 'done' | 'error'
  mode?: 'fast' | 'standard'
  agent?: SessionInfo
  startedAt?: number
  completedAt?: number
  error?: string
}

interface SeedState {
  status: 'idle' | 'creating' | 'monitoring' | 'running' | 'done' | 'error'
  sessions?: SessionInfo[]
  startedAt?: number
  completedAt?: number
  error?: string
}

interface HarvestAgentInfo {
  type: string
  status: string
  casesFound?: number
  startedAt?: number
  completedAt?: number
  lastError?: string
}

interface HarvestState {
  status: 'idle' | 'creating' | 'running' | 'done' | 'error'
  agents?: HarvestAgentInfo[]
  startedAt?: number
  completedAt?: number
  error?: string
}

interface RefreshState {
  status: 'idle' | 'running' | 'done' | 'error'
  startedAt?: number
  completedAt?: number
  casesFound?: number
  totalCandidates?: number
  error?: string
}

const HARVEST_BADGE: Record<string, { label: string; cls: string }> = {
  idle:     { label: 'Not started',  cls: 'bg-gray-100 text-gray-600' },
  creating: { label: 'Starting…',   cls: 'bg-blue-100 text-blue-700' },
  running:  { label: 'Scouts running', cls: 'bg-yellow-100 text-yellow-700' },
  done:     { label: 'Complete',    cls: 'bg-green-100 text-green-700' },
  error:    { label: 'Error',       cls: 'bg-red-100 text-red-700' },
}

const HARVEST_AGENT_BADGE: Record<string, { label: string; cls: string }> = {
  scouting:  { label: 'Scouting…',  cls: 'bg-blue-100 text-blue-700' },
  importing: { label: 'Importing…', cls: 'bg-orange-100 text-orange-700' },
  done:      { label: 'Done ✓',    cls: 'bg-green-100 text-green-700' },
  error:     { label: 'Error',     cls: 'bg-red-100 text-red-700' },
}

const SEED_BADGE: Record<string, { label: string; cls: string }> = {
  idle:       { label: 'Not started',        cls: 'bg-gray-100 text-gray-600' },
  creating:   { label: 'Creating sessions…', cls: 'bg-blue-100 text-blue-700' },
  monitoring: { label: 'Agents running',     cls: 'bg-yellow-100 text-yellow-700' },
  done:       { label: 'Complete',           cls: 'bg-green-100 text-green-700' },
  error:      { label: 'Error',              cls: 'bg-red-100 text-red-700' },
}

const SESSION_BADGE: Record<string, { label: string; cls: string }> = {
  scouting:  { label: 'Phase 1: Scouting…',  cls: 'bg-blue-100 text-blue-700' },
  handoff:   { label: 'Handing off…',        cls: 'bg-purple-100 text-purple-700' },
  analyzing: { label: 'Phase 2: Analyzing…', cls: 'bg-yellow-100 text-yellow-700' },
  importing: { label: 'Importing…',          cls: 'bg-orange-100 text-orange-700' },
  done:      { label: 'Done ✓',             cls: 'bg-green-100 text-green-700' },
  error:     { label: 'Error',              cls: 'bg-red-100 text-red-700' },
  // legacy keys kept for backwards compat
  monitoring: { label: 'Running…', cls: 'bg-blue-100 text-blue-700' },
}

const REFRESH_BADGE: Record<string, { label: string; cls: string }> = {
  idle:    { label: 'Ready',      cls: 'bg-gray-100 text-gray-600' },
  running: { label: 'Running…',   cls: 'bg-yellow-100 text-yellow-700' },
  done:    { label: 'Complete',   cls: 'bg-green-100 text-green-700' },
  error:   { label: 'Error',      cls: 'bg-red-100 text-red-700' },
}

function Badge({ info }: { info: { label: string; cls: string } }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${info.cls}`}>
      {info.label}
    </span>
  )
}

function elapsed(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function ResearchPage() {
  const [test, setTest] = useState<TestState>({ status: 'idle' })
  const [seed, setSeed] = useState<SeedState>({ status: 'idle' })
  const [harvest, setHarvest] = useState<HarvestState>({ status: 'idle' })
  const [refresh, setRefresh] = useState<RefreshState>({ status: 'idle' })
  const [loading, setLoading] = useState<'test' | 'seed' | 'harvest' | 'refresh' | null>(null)
  const [activeTestMode, setActiveTestMode] = useState<'fast' | 'standard' | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const [tRes, sRes, hRes, rRes] = await Promise.all([
        fetch('/api/research?action=test-status'),
        fetch('/api/research?action=seed-status'),
        fetch('/api/harvest'),
        fetch('/api/research?action=refresh-status'),
      ])
      if (tRes.ok) setTest(await tRes.json())
      if (sRes.ok) setSeed(await sRes.json())
      if (hRes.ok) setHarvest(await hRes.json())
      if (rRes.ok) setRefresh(await rRes.json())
      if (tRes.ok && sRes.ok && rRes.ok) setBackendError(null)
    } catch {
      setBackendError('Cannot reach research backend')
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Poll every 15s when any job is active
  useEffect(() => {
    const testActive    = test.status === 'running' || test.status === 'creating'
    const seedActive    = seed.status === 'running' || seed.status === 'creating'
    const harvestActive = harvest.status === 'running' || harvest.status === 'creating'
    if (!testActive && !seedActive && !harvestActive && refresh.status !== 'running') return
    const id = setInterval(fetchStatus, 15000)
    return () => clearInterval(id)
  }, [test.status, seed.status, harvest.status, refresh.status, fetchStatus])

  const startTest = async () => {
    setLoading('test')
    setActiveTestMode('standard')
    try {
      const res = await fetch('/api/research?action=test', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      await fetchStatus()
    } catch (err: any) {
      alert(`Failed to start test: ${err.message}`)
    } finally {
      setLoading(null)
      setActiveTestMode(null)
    }
  }

  const startFastTest = async () => {
    setLoading('test')
    setActiveTestMode('fast')
    try {
      const res = await fetch('/api/research?action=test-fast', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      await fetchStatus()
    } catch (err: any) {
      alert(`Failed to start fast test: ${err.message}`)
    } finally {
      setLoading(null)
      setActiveTestMode(null)
    }
  }

  const startSeed = async () => {
    setLoading('seed')
    try {
      const res = await fetch('/api/research?action=seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      await fetchStatus()
    } catch (err: any) {
      alert(`Failed to start seed: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const startRefresh = async () => {
    setLoading('refresh')
    try {
      const res = await fetch('/api/research?action=refresh', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      await fetchStatus()
    } catch (err: any) {
      alert(`Failed to start refresh: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const startHarvest = async () => {
    setLoading('harvest')
    try {
      const res = await fetch('/api/harvest', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      await fetchStatus()
    } catch (err: any) {
      alert(`Failed to start harvest: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const seedBusy    = seed.status === 'creating' || seed.status === 'monitoring' || seed.status === 'running'
  const harvestBusy = harvest.status === 'creating' || harvest.status === 'running'
  const refreshBusy = refresh.status === 'running'

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Research & Seed</h1>
        <p className="text-sm text-gray-500 mt-1">
          Automated case research via Anthropic Managed Agents
        </p>
      </div>

      {backendError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          ⚠️ {backendError} — make sure the DigitalOcean research server is running on port 3001
        </div>
      )}

      {/* ── Test Run ── */}
      <div className="bg-white rounded-xl border-2 border-dashed border-amber-300 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Pipeline Test Run</h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Run first</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Finds exactly 2 known cases to verify the full pipeline works before committing to the full seed.
              Takes ~30–45 min. Costs ~$1–3.
            </p>
          </div>
          <Badge info={SEED_BADGE[test.status === 'running' ? 'monitoring' : test.status] ?? SEED_BADGE.idle} />
        </div>

        {test.agent && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
            <span className="font-medium text-gray-700">Section 301 Scout → Analyst</span>
            <div className="flex items-center gap-3">
              {(test.agent.casesImported ?? 0) > 0 && (
                <span className="text-green-600 text-xs">{test.agent.casesImported} cases imported</span>
              )}
              <Badge info={SESSION_BADGE[test.agent.status] ?? { label: test.agent.status, cls: 'bg-gray-100 text-gray-600' }} />
            </div>
          </div>
        )}

        {test.status === 'done' && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            ✓ Test passed. Check <Link href="/admin/cases" className="underline font-medium">Admin → Cases</Link> for the 2 draft cases, then proceed to full seed.
          </p>
        )}

        {test.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            ✗ Test failed: {test.error}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={startTest}
            disabled={!!loading || test.status === 'running' || test.status === 'creating' || (test.status === 'done' && test.mode !== 'fast')}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === 'test' && activeTestMode === 'standard' ? 'Starting…'         :
             test.status === 'creating' && test.mode !== 'fast'  ? 'Creating session…' :
             test.status === 'running'  && test.mode !== 'fast'  ? 'Test running…'     :
             test.status === 'done'     && test.mode !== 'fast'  ? 'Test passed ✓'     :
             'Run Pipeline Test (2 cases)'}
          </button>
          <button
            onClick={startFastTest}
            disabled={!!loading || test.status === 'running' || test.status === 'creating'}
            className="px-3 py-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Skips real research — writes hardcoded JSON to verify infrastructure only"
          >
            {loading === 'test'         && activeTestMode === 'fast' ? 'Starting…'          :
             test.status === 'creating' && test.mode === 'fast'      ? 'Creating…'          :
             test.status === 'running'  && test.mode === 'fast'      ? 'Chain test running…' :
             test.status === 'done'     && test.mode === 'fast'      ? 'Chain test passed ✓' :
             'Quick Chain Test (~5 min)'}
          </button>
        </div>
      </div>

      {/* ── Harvest ── */}
      <div className="bg-white rounded-xl border-2 border-purple-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Harvest Cases</h2>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">New</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Bulk metadata harvest with no case limit. 3 Scouts run in parallel until all avenues are exhausted.
              Cases appear as <strong>Pending Analysis</strong> drafts — then use the Cases list to trigger
              per-case Opus analysis. Costs ~$3–8 for harvest only.
            </p>
          </div>
          <Badge info={HARVEST_BADGE[harvest.status] ?? HARVEST_BADGE.idle} />
        </div>

        {harvest.agents && harvest.agents.length > 0 && (
          <div className="space-y-2">
            {harvest.agents.map(a => (
              <div key={a.type} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="font-medium text-gray-700 uppercase tracking-wide text-xs">
                  Scout {a.type}
                </span>
                <div className="flex items-center gap-3">
                  {(a.casesFound ?? 0) > 0 && (
                    <span className="text-green-600 text-xs">{a.casesFound} cases</span>
                  )}
                  {a.startedAt && a.status !== 'done' && (
                    <span className="text-gray-400 text-xs">{elapsed(Date.now() - a.startedAt)} elapsed</span>
                  )}
                  <Badge info={HARVEST_AGENT_BADGE[a.status] ?? { label: a.status, cls: 'bg-gray-100 text-gray-600' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {harvest.status === 'done' && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            ✓ Harvest complete. Cases are pending analysis — go to{' '}
            <Link href="/admin/cases" className="underline font-medium">Admin → Cases</Link>{' '}
            and click <strong>Analyze</strong> on each case you want to process.
          </p>
        )}

        {harvest.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            Error: {harvest.error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={startHarvest}
            disabled={!!loading || harvestBusy}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === 'harvest'        ? 'Starting…'         :
             harvest.status === 'creating' ? 'Creating sessions…' :
             harvest.status === 'running'  ? 'Scouts running…'   :
             harvest.status === 'done'     ? 'Harvest again'     :
             'Harvest All Cases'}
          </button>
          {harvestBusy && (
            <button
              onClick={fetchStatus}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Refresh status
            </button>
          )}
        </div>
      </div>

      {/* ── Initial Seed (deprecated — use Harvest instead) ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 opacity-60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Initial Database Seed</h2>
              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">Deprecated — use Harvest instead</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Legacy pipeline: Scout → immediate Opus Analyst (coupled, 15-20 case limit). Replaced by Harvest + On-Demand Analyze above.
            </p>
          </div>
          <Badge info={SEED_BADGE[seed.status] ?? SEED_BADGE.idle} />
        </div>

        {seed.sessions && seed.sessions.length > 0 && (
          <div className="space-y-2">
            {seed.sessions.map(s => (
              <div
                key={s.type}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-gray-700 uppercase tracking-wide text-xs">
                  Agent {s.type}
                </span>
                <div className="flex items-center gap-3">
                  {(s.casesImported ?? 0) > 0 && (
                    <span className="text-green-600 text-xs">{s.casesImported} cases imported</span>
                  )}
                  {s.startedAt && s.status !== 'done' && (
                    <span className="text-gray-400 text-xs">{elapsed(Date.now() - s.startedAt)} elapsed</span>
                  )}
                  <Badge info={SESSION_BADGE[s.status] ?? { label: s.status, cls: 'bg-gray-100 text-gray-600' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {seed.status === 'done' && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            ✓ Seed complete. Review and approve new cases at{' '}
            <Link href="/admin/cases" className="underline font-medium">Admin → Cases</Link>.
          </p>
        )}

        {seed.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            Error: {seed.error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={startSeed}
            disabled={!!loading || seedBusy || seed.status === 'done'}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === 'seed'          ? 'Starting…'         :
             seed.status === 'creating'  ? 'Creating sessions…' :
             seed.status === 'monitoring'? 'Agents running…'    :
             seed.status === 'done'      ? 'Seed complete ✓'    :
             'Seed Database (3 Agents)'}
          </button>
          {seedBusy && (
            <button
              onClick={fetchStatus}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Refresh status
            </button>
          )}
        </div>
      </div>

      {/* ── Monthly Refresh ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Research New Cases</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Monthly refresh. Searches for new filings since the last refresh date across all
              tariff categories. Takes ~15 minutes. Results appear as drafts for your review.
            </p>
          </div>
          <Badge info={REFRESH_BADGE[refresh.status] ?? REFRESH_BADGE.idle} />
        </div>

        {refresh.status === 'done' && refresh.casesFound !== undefined && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            ✓ Found {refresh.totalCandidates ?? 0} candidates, imported {refresh.casesFound} new case{refresh.casesFound !== 1 ? 's' : ''} as drafts.{' '}
            <Link href="/admin/cases" className="underline font-medium">Review in Admin → Cases</Link>.
          </p>
        )}

        {refresh.status === 'running' && refresh.startedAt && (
          <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3">
            Research in progress — {elapsed(Date.now() - refresh.startedAt)} elapsed. Page polls every 15s automatically.
          </p>
        )}

        {refresh.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            Error: {refresh.error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={startRefresh}
            disabled={!!loading || refreshBusy}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading === 'refresh'          ? 'Starting…'           :
             refresh.status === 'running'   ? 'Research in progress…' :
             'Research New Cases'}
          </button>
          {refreshBusy && (
            <button
              onClick={fetchStatus}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Refresh status
            </button>
          )}
        </div>
      </div>

      {/* ── Info box ── */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm text-gray-600 space-y-2">
        <p className="font-medium text-gray-700">How this works</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All cases enter Supabase as <strong>drafts</strong> (is_published = false)</li>
          <li>Review and approve each case at <Link href="/admin/cases" className="underline">Admin → Cases</Link> before it goes public</li>
          <li>Each case must have ≥2 Tier-1 source URLs — the agents enforce this</li>
          <li>Research backend runs on DigitalOcean (port 3001)</li>
        </ul>
      </div>
    </div>
  )
}
