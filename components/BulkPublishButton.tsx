'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function BulkPublishButton({ draftCount }: { draftCount: number }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  if (draftCount === 0) return null

  async function handlePublishAll() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bulk-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      toast.success(`${data.published} cases published successfully.`)
      setConfirm(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
      >
        Publish All ({draftCount})
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Publish all analyzed cases?</span>
      <button
        onClick={handlePublishAll}
        disabled={loading}
        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Publishing…' : 'Yes, publish all'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        disabled={loading}
        className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  )
}
