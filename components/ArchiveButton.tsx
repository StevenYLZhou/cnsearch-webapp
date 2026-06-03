'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  caseId: string
  isPublished: boolean
  caseName: string
}

export default function ArchiveButton({ caseId, isPublished, caseName }: Props) {
  const [confirm, setConfirm] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleArchive() {
    setLoading(true)
    const res = await fetch(`/api/cases/${caseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: false }),
    })
    if (res.ok) {
      toast.success('Case archived (hidden from public).')
      router.push('/admin/cases')
      router.refresh()
    } else {
      toast.error('Failed to archive case.')
      setLoading(false)
    }
  }

  if (!isPublished) {
    return (
      <button
        onClick={async () => {
          setLoading(true)
          const res = await fetch(`/api/cases/${caseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_published: true }),
          })
          if (res.ok) { toast.success('Case restored to public.'); router.refresh() }
          else { toast.error('Failed to restore.'); setLoading(false) }
        }}
        disabled={loading}
        className="text-sm text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg"
      >
        Restore
      </button>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-sm text-amber-600 hover:text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg"
      >
        Archive (hide from public)
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder={`Type case code to confirm`}
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border border-red-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-red-300"
      />
      <button
        onClick={handleArchive}
        disabled={loading}
        className="text-sm text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg disabled:opacity-50"
      >
        Confirm Archive
      </button>
      <button onClick={() => { setConfirm(false); setInput('') }} className="text-xs text-gray-400">Cancel</button>
    </div>
  )
}
