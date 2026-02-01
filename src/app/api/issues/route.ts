import { createClientServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'

    const supabase = await createClientServer()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ issues: [] })

    const statusArray =
        status === 'all' ? ['pending', 'accepted', 'rejected', 'completed'] : [status]

    const { data: issues } = await supabase
        .from('issues')
        .select(`
            id,
            title,             
            amount,
            reason,
            status,
            created_at,
            user_id,
            profiles(name,email)
        `)
        .in('status', statusArray)
        .order('created_at', { ascending: false })


    return NextResponse.json({ issues })
}
