'use client'

import { useState } from 'react'

interface BendaharaActionsProps {
  issueId: string
}

export function BendaharaActions({ issueId }: BendaharaActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'accept' | 'reject') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/issues/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: issueId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      alert(data.message)
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex gap-3">
      <button
        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        onClick={() => handleAction('accept')}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Accept'}
      </button>

      <button
        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        onClick={() => handleAction('reject')}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Reject'}
      </button>
    </div>
  )
}
