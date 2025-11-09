import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ isAdmin: false, error: 'User ID required' })
    }

    console.log('Checking admin status for user:', userId)

    const supabase = createServerClient()
    
    // This uses the service role key and bypasses RLS
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('Admin check result:', { adminUser, error })

    if (error) {
      console.error('Admin check error:', error)
      // Even if there's an error, we'll return false
      return NextResponse.json({ isAdmin: false, error: error.message })
    }

    if (!adminUser) {
      return NextResponse.json({ isAdmin: false, error: 'User not found in admin_users' })
    }

    return NextResponse.json({ isAdmin: true, user: adminUser })
  } catch (error) {
    console.error('Admin check API error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Check failed' })
  }
}