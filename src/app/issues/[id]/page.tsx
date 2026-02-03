import { createClientServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { statusColor } from '@/types'
import { BendaharaActions } from '@/components/issues/BendaharaAction'
import UploadReceiptForm from '@/components/issues/UploadReceiptForm'

interface IssuePageProps {
  params: Promise<{ id: string }>  // ✅ FIX: Promise type
}

export default async function IssuePage(props: IssuePageProps) {
  const supabase = await createClientServer()
  const resolvedParams = await props.params  // ✅ FIX: Await params
  const { id: issueId } = resolvedParams

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
    .select('id, title, amount, reason, status, created_at, user_id, receipt_urls, remaining_amount')
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
          ? 'Issue diterima! Silakan unggah bukti belanja dan sisa uang untuk menyelesaikannya.'
          : 'Issue diterima. Menunggu karyawan mengunggah bukti & sisa uang.'
      case 'rejected':
        return isKaryawan
          ? 'Issue ini ditolak. Periksa alasan atau hubungi bendahara.'
          : 'Issue ditolak. Beri feedback kepada karyawan jika perlu.'
      case 'review_evidence':
        return isKaryawan
          ? 'Bukti sedang direview oleh bendahara. Harap tunggu.'
          : 'Review bukti belanja dan sisa uang. Validasi atau minta revisi.'
      case 'need_revision':
        return isKaryawan
          ? 'Bukti perlu direvisi. Silakan unggah ulang bukti dan sisa uang.'  // ✅ Show upload form
          : 'Revisi diminta. Tunggu karyawan mengunggah ulang.'
      case 'completed':
        return 'Issue selesai. Bukti dan sisa uang telah diverifikasi.'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-5 text-gray-800">Detail Issue</h1>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 space-y-5">
        {/* Title + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {issue.title && <h2 className="text-xl font-semibold text-gray-900 break-words">{issue.title}</h2>}
          <span
            className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium text-white ${statusColor(issue.status)} whitespace-nowrap`}
          >
            {issue.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        {/* Amount */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-xl font-bold text-indigo-600">Rp {issue.amount.toLocaleString()}</h3>
        </div>

        {/* Reason */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Justifikasi:</h4>
          <p className="text-gray-700 whitespace-pre-line">{issue.reason}</p>
        </div>

        <hr className="border-gray-200" />

        {/* Detail Info */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-700">Dibuat:</span>{' '}
            <span className="block sm:inline">{new Date(issue.created_at).toLocaleString()}</span>
          </div>
          {issue.remaining_amount !== null && (
            <div className="col-span-2">
              <span className="font-medium text-gray-700">Sisa Uang:</span>{' '}
              Rp {Number(issue.remaining_amount).toLocaleString()}
            </div>
          )}
        </div>

        {/* Status Description */}
        <p className="text-gray-600 italic text-sm">{statusDescription()}</p>

        {/* Bendahara Actions */}
        {isBendahara && (issue.status === 'pending' || issue.status === 'review_evidence') && (
          <div className="pt-2 pb-2">
            <BendaharaActions issueId={issue.id} currentStatus={issue.status} />
          </div>
        )}

        {/* ✅ Karyawan Upload - accepted OR need_revision + BELUM ada receipt */}
        {isKaryawan &&
          (issue.status === 'accepted' || issue.status === 'need_revision') &&
          (
            <div className="pt-2">
              <UploadReceiptForm
                issueId={issue.id}
                maxAmount={issue.amount}
              />

            </div>
          )}

        {/* Evidence View - SUDAH ada receipt (review_evidence, need_revision, completed) */}
        {issue.receipt_urls && issue.receipt_urls.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="font-medium text-gray-700 text-sm">Bukti Belanja:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {issue.receipt_urls.map((url: string, index: number) => (  // ✅ FIX: Type annotation
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square bg-gray-100 rounded-lg overflow-hidden border"
                >
                  <img
                    src={url}
                    alt={`Bukti ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
            {issue.remaining_amount !== null && (
              <p className="text-gray-700 text-sm mt-2">
                Sisa Uang: Rp {Number(issue.remaining_amount).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
