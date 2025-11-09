'use client'

import { useEffect, useState } from 'react'
import { useProtectedRoute } from '@/lib/protected-route'
import { createBrowserClient } from '@/lib/supabase'

interface UserData {
  email: string
  subscription_status: string
  trial_ends_at: string
  current_period_ends_at: string
  is_sponsored: boolean
}

interface PlatformSettings {
  monthly_price: number
  stripe_public_key: string
  stripe_secret_key: string
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_pass: string
  twilio_account_sid: string
  twilio_auth_token: string
  twilio_phone_number: string
}

export default function SettingsPage() {
  useProtectedRoute()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'notifications'>('profile')

  useEffect(() => {
    loadUserData()
    loadPlatformSettings()
  }, [])

  const loadUserData = async () => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('users')
        .select('email, subscription_status, trial_ends_at, current_period_ends_at, is_sponsored')
        .eq('id', user.id)
        .single()

      setUserData(data)
    }
    setLoading(false)
  }

  const loadPlatformSettings = async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    setPlatformSettings(data)
  }

  const handleSubscribe = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe()
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleManageBilling = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/payment/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create billing portal session')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const loadStripe = async () => {
    const { loadStripe } = await import('@stripe/stripe-js')
    return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }

  const getSubscriptionStatus = () => {
    if (userData?.is_sponsored) {
      return { text: 'Sponsored', color: 'text-green-600', bg: 'bg-green-100' }
    }

    switch (userData?.subscription_status) {
      case 'active':
        return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' }
      case 'trial':
        return { text: 'Trial', color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'past_due':
        return { text: 'Past Due', color: 'text-red-600', bg: 'bg-red-100' }
      case 'canceled':
        return { text: 'Canceled', color: 'text-gray-600', bg: 'bg-gray-100' }
      default:
        return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </header>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const status = getSubscriptionStatus()
  const monthlyPrice = platformSettings?.monthly_price || 29.99

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', name: 'Business Profile' },
                { id: 'billing', name: 'Billing & Subscription' },
                { id: 'notifications', name: 'Notifications' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white shadow-sm rounded-lg">
            {/* Business Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Business Profile</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                      {userData?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  {userData?.subscription_status === 'trial' && userData.trial_ends_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trial Ends
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(userData.trial_ends_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {userData?.current_period_ends_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Period Ends
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(userData.current_period_ends_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing & Subscription Tab */}
            {activeTab === 'billing' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Billing & Subscription</h2>
                
                {userData?.is_sponsored ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-green-400">✓</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Your account is sponsored
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          No payment required. Your account has full access to all features.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Plan</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color} mt-1`}>
                            {status.text}
                          </span>
                        </div>
                        
                        {userData?.subscription_status === 'trial' && userData.trial_ends_at && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Trial ends</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(userData.trial_ends_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Pricing</h3>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          €{monthlyPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">per month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Price set by platform administrator
                      </p>
                    </div>

                    {/* Subscription Actions */}
                    <div className="space-y-3">
                      {userData?.subscription_status === 'trial' && (
                        <button
                          onClick={handleSubscribe}
                          disabled={processing}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {processing ? 'Processing...' : `Subscribe Now - €${monthlyPrice.toFixed(2)}/month`}
                        </button>
                      )}

                      {(userData?.subscription_status === 'active' || userData?.subscription_status === 'past_due') && (
                        <div className="space-y-3">
                          <button
                            onClick={handleManageBilling}
                            disabled={processing}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing ? 'Loading...' : 'Manage Billing & Subscription'}
                          </button>
                          <p className="text-xs text-gray-500 text-center">
                            Manage your payment methods, view invoices, and update your subscription
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive compliance task reminders via email
                        </p>
                        {platformSettings?.smtp_host ? (
                          <p className="text-xs text-green-600 mt-1">✓ Email service configured</p>
                        ) : (
                          <p className="text-xs text-yellow-600 mt-1">⚠ Email service not configured</p>
                        )}
                      </div>
                      <button
                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-sm"
                        disabled
                      >
                        Configured by Admin
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Notifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">WhatsApp Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive compliance task reminders via WhatsApp
                        </p>
                        {platformSettings?.twilio_account_sid ? (
                          <p className="text-xs text-green-600 mt-1">✓ WhatsApp service configured</p>
                        ) : (
                          <p className="text-xs text-yellow-600 mt-1">⚠ WhatsApp service not configured</p>
                        )}
                      </div>
                      <button
                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-sm"
                        disabled
                      >
                        Configured by Admin
                      </button>
                    </div>
                  </div>

                  {/* Reminder Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Reminder Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Days before due date to send reminders</span>
                        <span className="text-sm text-gray-500">7, 3, 1 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Quiet hours</span>
                        <span className="text-sm text-gray-500">8:00 PM - 8:00 AM</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      These settings are managed by your organization administrator
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help & Support Section */}
          <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Help & Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Contact Support</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Need help with your account or have questions about compliance?
                </p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-500">
                  Contact Support Team →
                </button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Documentation</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Browse our knowledge base for guides and tutorials.
                </p>
                <button 
                  onClick={() => window.location.href = '/knowledge'}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                >
                  Visit Knowledge Hub →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}