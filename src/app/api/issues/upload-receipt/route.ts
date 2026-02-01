// app/api/issues/[id]/upload-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase-server'
import formidable, { File as FormidableFile } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = { api: { bodyParser: false } } // next.js khusus upload

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ambil issue
  const { data: issue } = await supabase
    .from('issues')
    .select('id, user_id, status')
    .eq('id', params.id)
    .single()

  if (!issue || issue.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (issue.status !== 'accepted') {
    return NextResponse.json({ error: 'Cannot upload receipt for this status' }, { status: 400 })
  }

  // parse file upload dengan Promise
  const uploadedFile = await new Promise<FormidableFile>((resolve, reject) => {
    const form = new formidable.IncomingForm()
    form.parse(req as any, (err, _fields, files) => {
      if (err) return reject(err)

      // files.receipt bisa File | File[]
      const fileList = Array.isArray(files.receipt) ? files.receipt : [files.receipt]
      const file = fileList[0] as FormidableFile
      if (!file) return reject(new Error('No file uploaded'))

      // pastikan folder exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

      const dest = path.join(uploadDir, file.originalFilename || 'receipt')
      fs.renameSync(file.filepath, dest)

      resolve(file)
    })
  })

  const receiptPath = `/uploads/${uploadedFile.originalFilename}`

  // update issue status → completed
  const { error } = await supabase
    .from('issues')
    .update({ status: 'completed', receipt_url: receiptPath })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ message: 'Receipt uploaded, issue completed', receipt_url: receiptPath })
}
