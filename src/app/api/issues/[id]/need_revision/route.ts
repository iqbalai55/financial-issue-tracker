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

  // 2. Get issue & ownership check
  const { data, error } = await supabase
    .from('issues')
    .select('status, user_id')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
  }

  // 3. Update to need_revision
  const { error: updateError } = await supabase
    .from('issues')
    .update({ status: 'need_revision' })
    .eq('id', resolvedParams.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to request revision' }, { status: 500 })
  }

  return NextResponse.json({ 
    message: 'Revisi berhasil diminta! Status diubah ke need_revision' 
  })
}
