import Link from 'next/link'
import { IssuesListClient } from '@/components/issues/IssueListClient'

export default function IssuesPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Issues</h1>
        <Link
          href="/issues/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Buat Issue Baru
        </Link>
      </div>

      {/* Client-side filter + list */}
      <IssuesListClient />
    </div>
  )
}
