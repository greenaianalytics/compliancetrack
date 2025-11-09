import { NextRequest, NextResponse } from 'next/server'
import { createBillingPortalSession } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({ error: 'No customer found' }, { status: 400 })
    }

    const session = await createBillingPortalSession(
      userData.stripe_customer_id,
      `${process.env.NEXTAUTH_URL}/settings`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}