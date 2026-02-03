// app/api/issues/[id]/complete/route.ts

import { createClientServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClientServer()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Get profile untuk check bendahara role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'bendahara') {
    return NextResponse.json({ error: 'Forbidden - Bendahara only' }, { status: 403 })
  }

  // 3. Get issue & status check
  const { data: issue, error: fetchError } = await supabase
    .from('issues')
    .select('id, status, user_id, receipt_urls, remaining_amount')
    .eq('id', resolvedParams.id)
    .single()

  if (fetchError || !issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
  }

  // 4. Pastikan ada receipt_urls & remaining_amount
  if (!issue.receipt_urls || issue.receipt_urls.length === 0) {
    return NextResponse.json({ error: 'Receipt belum diupload' }, { status: 400 })
  }

  if (issue.remaining_amount === null || issue.remaining_amount < 0) {
    return NextResponse.json({ error: 'Sisa uang belum divalidasi' }, { status: 400 })
  }

  // 5. Update ke completed
  const { error: updateError } = await supabase
    .from('issues')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', resolvedParams.id)

  if (updateError) {
    console.error('Complete update error:', updateError)
    return NextResponse.json({ error: 'Failed to complete issue' }, { status: 500 })
  }

  return NextResponse.json({ 
    message: '✅ Issue berhasil divalidasi dan diselesaikan!',
    issueId: resolvedParams.id
  })
}
