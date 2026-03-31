import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import { apiRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = apiRateLimit(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current subscription status
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status, stripe_customer_id, is_sponsored')
      .eq('id', user.id)
      .single()

    if (userData?.is_sponsored) {
      return NextResponse.json({ error: 'Sponsored accounts do not require payment' }, { status: 400 })
    }

    // Get platform settings for price
    const { data: platformSettings } = await supabase
      .from('platform_settings')
      .select('monthly_price')
      .single()

    const price = platformSettings?.monthly_price || 29.99

    // Create a Stripe Price for recurring billing
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const priceData = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: 'Compliance Track Monthly Subscription',
        metadata: {
          description: 'Monthly access to compliance tracking and management'
        },
      },
    })

    const successUrl = `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${process.env.NEXTAUTH_URL}/settings`

    // Create checkout session with subscription
    const session = await stripe.checkout.sessions.create({
      customer: userData?.stripe_customer_id || undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceData.id,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: userData?.subscription_status === 'trial' ? 0 : 30, // No trial if already had one
        metadata: {
          user_id: user.id,
          plan_type: 'monthly'
        }
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userData?.stripe_customer_id ? undefined : user.email,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
