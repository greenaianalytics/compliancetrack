import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed.', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session, supabase)
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, supabase)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription, supabase)
        break

      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, supabase)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const { customer, subscription } = session

  if (!customer || !subscription) return

  // Update user's subscription status
  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customer as string,
      subscription_status: 'active',
      current_period_ends_at: new Date((subscription as Stripe.Subscription).current_period_end * 1000).toISOString()
    })
    .eq('email', session.customer_email)

  if (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  const { customer, status, current_period_end } = subscription

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      current_period_ends_at: new Date(current_period_end * 1000).toISOString()
    })
    .eq('stripe_customer_id', customer as string)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const { customer } = subscription

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      current_period_ends_at: null
    })
    .eq('stripe_customer_id', customer as string)

  if (error) {
    console.error('Error canceling subscription:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const { customer } = invoice

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'past_due'
    })
    .eq('stripe_customer_id', customer as string)

  if (error) {
    console.error('Error updating payment failed status:', error)
  }
}