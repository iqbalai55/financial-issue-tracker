'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Tambahkan title di schema
const schema = z.object({
  title: z.string().min(1).max(100), // baru
  amount: z.coerce.number().positive(),
  reason: z.string().min(1).max(500),
})

type FormData = z.infer<typeof schema>

export default function NewIssue() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setErrorMsg(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('User tidak terautentikasi')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('issues').insert({
      title: data.title,      // <-- baru
      amount: data.amount,
      reason: data.reason,
      user_id: user.id,       // wajib sesuai RLS
    })

    setLoading(false)

    if (error) {
      setErrorMsg('Terjadi kesalahan saat membuat issue. Coba lagi.')
      return
    }

    reset() // reset form
    router.push('/issues')
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Buat Issue Baru</h1>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Judul</label>
          <input
            type="text"
            {...register('title')}
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Jumlah Uang</label>
          <input
            type="number"
            {...register('amount')}
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">Alasan</label>
          <textarea
            {...register('reason')}
            rows={4}
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Buat Issue'}
        </button>
      </form>
    </div>
  )
}
