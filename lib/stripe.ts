import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Subscription plans
export const PLANS = {
  monthly: {
    price: 29.99, // Default price, admin can change this
    interval: 'month' as const,
  }
}

export const createCheckoutSession = async (
  customerId: string | null,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId || undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 30, // 30-day trial
    },
  })

  return session
}

export const createBillingPortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}