import { createClientServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { statusColor } from '@/types'
import { BendaharaActions } from '@/components/issues/BendaharaAction'

interface IssuePageProps {
  params: { id: string }
}

export default async function IssuePage(props: IssuePageProps) {
  const supabase = await createClientServer()
  const { id: issueId } = await props.params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  const isBendahara = role === 'bendahara'
  const isKaryawan = role === 'karyawan'

  const { data: issue, error } = await supabase
    .from('issues')
    .select('id, title, amount, reason, status, created_at, user_id, receipt_url')
    .eq('id', issueId)
    .single()


  if (error || !issue) return notFound()

  // Penjelasan status
  const statusDescription = () => {
    switch (issue.status) {
      case 'pending':
        return isKaryawan
          ? 'Issue kamu sedang menunggu review bendahara. Harap sabar menunggu.'
          : 'Menunggu persetujuan atau penolakan'
      case 'accepted':
        return isKaryawan
          ? 'Issue diterima! Silakan unggah bukti belanja atau struk untuk menyelesaikannya.'
          : 'Issue diterima, menunggu karyawan mengunggah bukti belanja.'
      case 'rejected':
        return isKaryawan
          ? 'Issue ini ditolak. Periksa alasan atau hubungi bendahara.'
          : 'Issue ditolak, beri feedback kepada karyawan jika perlu.'
      case 'completed':
        return 'Issue selesai, bukti belanja telah diunggah.'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Detail Issue</h1>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Title + Status */}
        <div className="flex justify-between items-center">
          {issue.title && <h2 className="text-2xl font-semibold text-gray-900">{issue.title}</h2>}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusColor(issue.status)} shadow`}
          >
            {issue.status.toUpperCase()}
          </span>
        </div>

        {/* Amount */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-xl font-bold text-indigo-600">Rp {issue.amount.toLocaleString()}</h3>
        </div>

        {/* Reason */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-1">Justifikasi:</h4>
          <p className="text-gray-700">{issue.reason}</p>
        </div>

        <hr className="border-gray-200" />

        {/* Detail Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div><span className="font-medium text-gray-700">ID:</span> {issue.id}</div>
          <div><span className="font-medium text-gray-700">Dibuat:</span> {new Date(issue.created_at).toLocaleString()}</div>
        </div>

        {/* Status Description */}
        <p className="text-gray-600 italic">{statusDescription()}</p>

        {/* Bendahara Actions (di dalam card) */}
        {isBendahara && issue.status === 'pending' && (
          <BendaharaActions issueId={issue.id} />
        )}



        {/* Karyawan Upload */}
        {isKaryawan && issue.status === 'accepted' && !issue.receipt_url && (
          <form
            action={`/api/issues/${issue.id}/upload-receipt`}
            method="post"
            encType="multipart/form-data"
            className="mt-4 flex flex-col gap-2"
          >
            <label className="font-medium text-gray-700">Upload Bukti Belanja / Struk</label>
            <input type="file" name="receipt" className="border p-2 rounded-lg" required />
            <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Upload & Complete
            </button>
          </form>
        )}

        {/* Completed */}
        {issue.status === 'completed' && issue.receipt_url && (
          <p className="mt-4 text-green-700 font-medium">
            Bukti Belanja: <a href={issue.receipt_url} target="_blank" className="underline">Lihat Struk</a>
          </p>
        )}
      </div>
    </div >

  )
}
