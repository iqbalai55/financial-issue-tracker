'use client'

import { useEffect, useState } from 'react'
import { statusColor } from '@/types'
import Link from 'next/link'

const STATUSES = ['all', 'pending', 'accepted', 'rejected', 'completed', 'review_evidence', 'need_revision'] as const
type Status = (typeof STATUSES)[number]

interface Profile {
    name: string
    email: string
}

interface Issue {
    id: string
    title: string
    amount: number
    reason: string
    status: string
    created_at: string
    user_id: string
    profiles?: Profile
}

// Helper function untuk format status
const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase()
}

export function IssuesListClient() {
    const [statusFilter, setStatusFilter] = useState<Status>('all')
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(false)

    const fetchIssues = async (status: Status) => {
        setLoading(true)
        try {
            const query = new URLSearchParams()
            if (status !== 'all') query.set('status', status)
            const res = await fetch(`/api/issues?${query.toString()}`)
            const data = await res.json()

            // Pastikan issues selalu array
            setIssues(Array.isArray(data.issues) ? data.issues : [])
        } catch (err) {
            console.error(err)
            setIssues([]) // fallback kalau error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIssues(statusFilter)
    }, [statusFilter])

    return (
        <div className="w-full">
            {/* Filter tombol */}
            <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto">
                {STATUSES.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            statusFilter === s
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                        {formatStatus(s)} {/* ✅ Ganti sini */}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && <p className="text-gray-500">Loading...</p>}

            {/* List */}
            <div className="grid gap-4">
                {issues.map((issue) => (
                    <div
                        key={issue.id}
                        className="border border-gray-200 shadow-sm p-4 sm:p-6 rounded-xl hover:shadow-md transition-shadow duration-200 flex flex-col"
                    >
                        {/* Header: title + amount + status */}
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                            <div>
                                <h3 className="font-bold text-base sm:text-lg text-gray-900">{issue.title}</h3>
                                <h4 className="font-semibold text-lg sm:text-xl text-gray-800 mt-1">
                                    Rp {issue.amount.toLocaleString()}
                                </h4>
                                <p className="text-gray-600 mt-1 text-sm sm:text-base">{issue.reason}</p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(issue.status)}`}
                            >
                                {formatStatus(issue.status)} {/* ✅ Ganti sini juga */}
                            </span>
                        </div>

                        {/* Info user + tanggal */}
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 mt-3 mb-4 gap-1 sm:gap-0">
                            <p className="break-words">
                                Dibuat oleh:{' '}
                                <span className="font-medium text-gray-700">{issue.profiles?.name}</span> (
                                {issue.profiles?.email})
                            </p>
                            <p>
                                Tanggal:{' '}
                                <span className="font-medium text-gray-700">
                                    {new Date(issue.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </p>
                        </div>

                        {/* Tombol Detail */}
                        <div className="flex flex-wrap gap-2 mt-auto">
                            <Link
                                href={`/issues/${issue.id}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-blue-700 transition-colors"
                            >
                                Detail
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty state */}
                {!loading && issues.length === 0 && (
                    <p className="text-gray-500">Tidak ada issue untuk status ini.</p>
                )}
            </div>
        </div>
    )
}
