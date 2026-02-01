// app/api/issues/accept/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClientServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // cek role bendahara
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'bendahara') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // get id from POST body
  const body = await req.json()
  const issueId = body.id
  if (!issueId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // update status issue
  const { error } = await supabase
    .from('issues')
    .update({ status: 'accepted' })
    .eq('id', issueId)
    .eq('status', 'pending')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ message: 'Issue accepted' })
}
