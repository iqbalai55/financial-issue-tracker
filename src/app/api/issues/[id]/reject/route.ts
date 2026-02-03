// app/api/issues/[id]/reject/route.ts  ← INI LOKASI BENAR!

import { createClientServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params  // ← Ambil issueId dari PATH
  const supabase = await createClientServer()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Cek role bendahara
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'bendahara') {
    return NextResponse.json({ error: 'Forbidden - Bendahara only' }, { status: 403 })
  }

  // 3. Get issue & status check (harus pending)
  const { data: issue, error: fetchError } = await supabase
    .from('issues')
    .select('id, status')
    .eq('id', resolvedParams.id)  // ← Dari PATH, bukan body
    .single()

  if (fetchError || !issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
  }

  if (issue.status !== 'pending') {
    return NextResponse.json({ error: 'Issue must be pending to reject' }, { status: 400 })
  }

  // 4. Update status → rejected
  const { error: updateError } = await supabase
    .from('issues')
    .update({ 
      status: 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('id', resolvedParams.id)  // ← Dari PATH
    .eq('status', 'pending')      // ← Atomic update

  if (updateError) {
    console.error('Reject error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ 
    message: '❌ Issue berhasil ditolak! Status: rejected' 
  })
}
