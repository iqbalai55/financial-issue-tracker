'use client'

import { useState } from 'react'

interface BendaharaActionsProps {
  issueId: string
  currentStatus: 'pending' | 'review_evidence'
}

export function BendaharaActions({ issueId, currentStatus }: BendaharaActionsProps) {
  const [loadingAccept, setLoadingAccept] = useState(false)
  const [loadingReject, setLoadingReject] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [loadingRevise, setLoadingRevise] = useState(false)

  const handleAction = async (
    action: 'accept' | 'reject' | 'complete' | 'need_revision',
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true)
    try {
      // ✅ FIX: URL dengan issueId
      const res = await fetch(`/api/issues/${issueId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      // ✅ BETTER error handling
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Action failed')
      }
      
      const data = await res.json()
      alert(data.message || 'Success!')
      window.location.reload()
    } catch (err: any) {
      console.error('Action error:', err)
      alert(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'pending') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
          onClick={() => handleAction('accept', setLoadingAccept)}
          disabled={loadingAccept}
        >
          {loadingAccept ? 'Loading...' : '✅ Terima'}
        </button>
        <button
          className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full sm:w-auto"
          onClick={() => handleAction('reject', setLoadingReject)}
          disabled={loadingReject}
        >
          {loadingReject ? 'Loading...' : '❌ Tolak'}
        </button>
      </div>
    )
  }

  if (currentStatus === 'review_evidence') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
          onClick={() => handleAction('complete', setLoadingComplete)}
          disabled={loadingComplete}
        >
          {loadingComplete ? 'Loading...' : 'Validasi'}
        </button>
        <button
          className="px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition w-full sm:w-auto"
          onClick={() => handleAction('need_revision', setLoadingRevise)}
          disabled={loadingRevise}
        >
          {loadingRevise ? 'Loading...' : 'Minta Revisi'}
        </button>
      </div>
    )
  }

  return null
}
