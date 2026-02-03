// app/api/issues/[id]/upload-receipt/route.ts
// ✅ SIMPLE TIMPA - Langsung ganti data lama

import { createClientServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClientServer()

  // 1. Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validasi issue ownership
  if (!resolvedParams.id) {
    return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 })
  }

  const { data: existingIssue, error: fetchError } = await supabase
    .from('issues')
    .select('id, user_id, receipt_urls')
    .eq('id', resolvedParams.id)
    .single()

  if (fetchError || !existingIssue || existingIssue.user_id !== user.id) {
    return NextResponse.json({ error: 'Issue not found or forbidden' }, { status: 403 })
  }

  // 3. Parse form
  const formData = await request.formData()
  const files = formData.getAll('receipts') as File[]
  const remainingAmount = formData.get('remaining_amount') as string

  if (files.length === 0 || !remainingAmount || isNaN(Number(remainingAmount))) {
    return NextResponse.json({ error: 'File dan sisa uang wajib' }, { status: 400 })
  }

  const uploadedUrls: string[] = []
  const newFilePaths: string[] = []

  try {
    // ✅ TIMPA: Hapus receipts lama
    if (existingIssue.receipt_urls && existingIssue.receipt_urls.length > 0) {
      const oldPaths = existingIssue.receipt_urls.map((url: string) => {
        const path = url.split('/receipts/')[1]
        return `receipts/${user.id}/${path}`
      })
      const { error: deleteError } = await supabase.storage
        .from('receipts')
        .remove(oldPaths)
      if (deleteError) console.warn('Failed to delete old files:', deleteError)
    }

    // 4. Upload files BARU
    for (const file of files) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `receipts/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true,  // ✅ OVERWRITE kalau sama nama
        })

      if (uploadError) {
        throw new Error(`Gagal upload ${file.name}: ${uploadError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrlData.publicUrl)
      newFilePaths.push(filePath)
    }

    // 5. ✅ TIMPA database - ganti semua data lama
    const { error: updateError } = await supabase
      .from('issues')
      .update({
        receipt_urls: uploadedUrls,        // ← GANTI array lama
        remaining_amount: parseInt(remainingAmount),  // ← GANTI nilai lama
        status: 'review_evidence',        // ← Kembali review
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)

    if (updateError) {
      // Cleanup kalau update gagal
      await supabase.storage.from('receipts').remove(newFilePaths)
      throw new Error(`Gagal update: ${updateError.message}`)
    }

    return NextResponse.json({
      message: '✅ Bukti berhasil diupdate!',
      count: uploadedUrls.length
    })

  } catch (error: any) {
    // Cleanup new files
    if (newFilePaths.length > 0) {
      await supabase.storage.from('receipts').remove(newFilePaths)
    }
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
