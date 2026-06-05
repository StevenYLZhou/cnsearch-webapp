'use client'

import { useState, useEffect, useCallback } from 'react'

const STATUS_DISPLAY: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',    cls: 'bg-gray-100 text-gray-500' },
  analyzing: { label: 'Analyzing…', cls: 'bg-yellow-100 text-yellow-700' },
  done:      { label: 'Analyzed',   cls: 'bg-green-100 text-green-700' },
  failed:    { label: 'Failed',     cls: 'bg-red-100 text-red-600' },
}

interface Props {
  caseId: string
  initialStatus: string | null
}

export function AnalyzeButton({ caseId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus ?? 'pending')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyze?caseId=${encodeURIComponent(caseId)}`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data.analysis_status ?? 'pending')
      }
    } catch {
      // ignore transient fetch errors during polling
    }
  }, [caseId])

  // On mount: fetch real status once (handles external triggers / stale server render)
  useEffect(() => {
    pollStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // While analyzing: poll every 5s
  useEffect(() => {
    if (status !== 'analyzing') return
    const id = setInterval(pollStatus, 5000)
    return () => clearInterval(id)
  }, [status, pollStatus])

  const handleAnalyze = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setStatus('analyzing')
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const display = STATUS_DISPLAY[status] ?? STATUS_DISPLAY.pending

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${display.cls}`}>
        {display.label}
      </span>
      {(status === 'pending' || status === 'failed') && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          title={errorMsg ?? undefined}
          className="text-purple-600 hover:text-purple-800 text-xs font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Starting…' : 'Analyze'}
        </button>
      )}
      {errorMsg && (
        <span className="text-xs text-red-500" title={errorMsg}>⚠</span>
      )}
    </div>
  )
}
