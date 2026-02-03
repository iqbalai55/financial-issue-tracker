'use client'
import { useState } from 'react'

interface UploadReceiptFormProps {
  issueId: string
  maxAmount: number
}

export default function UploadReceiptForm({ issueId, maxAmount }: UploadReceiptFormProps) {
  const [files, setFiles] = useState<FileList | null>(null)
  const [remainingAmount, setRemainingAmount] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) {
      setError('Pilih minimal 1 file bukti')
      return
    }

    // Reset messages
    setError('')
    setSuccess('')

    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('receipts', file))
    formData.append('remaining_amount', remainingAmount.toString())

    setLoading(true)
    try {
      const res = await fetch(`/api/issues/${issueId}/upload-receipt`, {
        method: 'POST',
        body: formData,
      })

      // ✅ Better error handling
      if (!res.ok) {
        const errorData = await res.text()
        throw new Error(errorData || 'Upload gagal')
      }
      
      const data = await res.json()
      
      // ✅ Show success message
      setSuccess(`✅ Bukti berhasil diupload! (${data.count || 0} file)`)
      
      // Clear form
      setFiles(null)
      setRemainingAmount('')
      
      // Auto reload setelah 1.5 detik
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Terjadi kesalahan saat upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ✅ Success message */}
      {success && (
        <div className="p-3 bg-green-100 border border-green-200 rounded-lg text-green-800 text-sm">
          {success}
        </div>
      )}
      
      {/* ✅ Error message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ✅ Revisi info */}
        <div>
          <label className="block font-medium text-gray-700 text-sm mb-2">
            Upload Bukti Belanja / Struk
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={e => {
              setFiles(e.target.files)
              setError('') // Clear error saat pilih file baru
            }}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {files && (
            <p className="text-sm text-gray-600 mt-1">
              {files.length} file terpilih: {Array.from(files).map(f => f.name).join(', ')}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-700 text-sm mb-2">
            Sisa Uang (Rp)
          </label>
          <input
            type="number"
            min={0}
            max={maxAmount}
            placeholder="Contoh: 15000"
            value={remainingAmount}
            onChange={e => {
              setRemainingAmount(e.target.value ? Number(e.target.value) : '')
              setError('')
            }}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !files || !remainingAmount}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            'Kirim Bukti & Sisa Uang'
          )}
        </button>
      </form>
    </div>
  )
}
