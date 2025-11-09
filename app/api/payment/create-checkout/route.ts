import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current subscription status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_status, stripe_customer_id, is_sponsored')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is sponsored
    if (userData.is_sponsored) {
      return NextResponse.json({ error: 'Sponsored accounts do not require payment' }, { status: 400 })
    }

    // Get platform settings for price and trial days
    const { data: platformSettings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('monthly_price, trial_days, stripe_secret_key')
      .single()

    if (settingsError || !platformSettings) {
      console.error('Error fetching platform settings:', settingsError)
      return NextResponse.json({ error: 'Platform configuration error' }, { status: 500 })
    }

    const price = platformSettings?.monthly_price || 29.99
    const trialDays = platformSettings?.trial_days || 30

    // Check if Stripe is configured
    if (!platformSettings.stripe_secret_key) {
      return NextResponse.json({ error: 'Stripe is not configured. Please contact support.' }, { status: 500 })
    }

    // Import Stripe dynamically with the configured secret key
    const stripe = require('stripe')(platformSettings.stripe_secret_key)

    // Create a Stripe Price for this amount
    let priceData
    try {
      priceData = await stripe.prices.create({
        unit_amount: Math.round(price * 100), // Convert to cents
        currency: 'eur',
        recurring: {
          interval: 'month',
        },
        product_data: {
          name: 'Compliance Track Monthly Subscription',
          description: 'Full access to compliance tracking and management features',
        },
      })
    } catch (stripeError: any) {
      console.error('Stripe price creation error:', stripeError)
      return NextResponse.json({ error: 'Payment configuration error: ' + stripeError.message }, { status: 500 })
    }

    const successUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings`

    // Create Stripe checkout session
    let session
    try {
      session = await stripe.checkout.sessions.create({
        customer: userData.stripe_customer_id || undefined,
        line_items: [
          {
            price: priceData.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: trialDays,
        },
        customer_email: userData.stripe_customer_id ? undefined : user.email,
        metadata: {
          userId: user.id,
        },
      })
    } catch (sessionError: any) {
      console.error('Stripe session creation error:', sessionError)
      return NextResponse.json({ error: 'Checkout session error: ' + sessionError.message }, { status: 500 })
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}