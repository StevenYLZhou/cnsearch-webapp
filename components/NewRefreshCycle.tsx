'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewRefreshCycle() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function start() {
    setSaving(true)
    const res = await fetch('/api/update-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    if (res.ok) {
      toast.success('Refresh cycle started. Add or edit cases, then mark it complete.')
      setOpen(false)
      setNotes('')
      router.refresh()
    } else {
      toast.error('Failed to start cycle.')
    }
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Start Refresh Cycle
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="One-line note (e.g. June 2026 update)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={start}
        disabled={saving}
        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Starting…' : 'Start'}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400">Cancel</button>
    </div>
  )
}
