'use client'

import { PaymentSettings } from '@/types/settings'

interface PaymentSettingsProps {
  settings: PaymentSettings
}

export default function PaymentSettingsForm({ settings }: PaymentSettingsProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      trial: { color: 'bg-blue-100 text-blue-800', text: 'Free Trial' },
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      cancelled: { color: 'bg-yellow-100 text-yellow-800', text: 'Cancelled' },
      expired: { color: 'bg-red-100 text-red-800', text: 'Expired' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.trial
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getSubscriptionType = (type: string) => {
    const typeConfig = {
      free: { text: 'Free Trial', description: 'You are currently on a free trial' },
      paid: { text: 'Paid Subscription', description: 'Active paid subscription' },
      sponsored: { text: 'Sponsored', description: 'Your account is sponsored' },
    }
    
    return typeConfig[type as keyof typeof typeConfig] || typeConfig.free
  }

  const subscriptionInfo = getSubscriptionType(settings.subscription_type)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Payment & Billing</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-600">{subscriptionInfo.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">€29.99</div>
            <div className="text-sm text-gray-600">per month</div>
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Status
            </label>
            <div>{getStatusBadge(settings.subscription_status)}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Type
            </label>
            <div className="text-sm text-gray-900">{subscriptionInfo.text}</div>
          </div>
        </div>

        {/* Trial Information */}
        {settings.subscription_status === 'trial' && settings.trial_ends_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Free Trial Active
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your free trial ends on {new Date(settings.trial_ends_at).toLocaleDateString('en-IE')}. 
                    Upgrade to a paid plan to continue using all features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sponsored Information */}
        {settings.subscription_type === 'sponsored' && settings.sponsored_until && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Account Sponsored
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your account is sponsored until {new Date(settings.sponsored_until).toLocaleDateString('en-IE')}. 
                    No payment is required during this period.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Email
          </label>
          <input
            type="email"
            value={settings.billing_email}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Contact support to update your billing email
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {settings.subscription_status === 'trial' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Upgrade to Paid Plan
            </button>
          )}
          
          {settings.subscription_status === 'active' && (
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Cancel Subscription
            </button>
          )}
          
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            View Billing History
          </button>
          
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600">
          For billing inquiries or to change your subscription, please contact our support team at{' '}
          <a href="mailto:support@greenai-analytics.com" className="text-blue-600 hover:text-blue-500">
            support@greenai-analytics.com
          </a>
        </p>
      </div>
    </div>
  )
}