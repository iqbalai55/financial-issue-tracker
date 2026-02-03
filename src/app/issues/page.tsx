import Link from 'next/link'
import { IssuesListClient } from '@/components/issues/IssueListClient'

export default function IssuesPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Issues</h1>
        <Link
          href="/issues/new"
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Buat Issue Baru
        </Link>
      </div>

      {/* Client-side filter + list */}
      <IssuesListClient />
    </div>
  )
}