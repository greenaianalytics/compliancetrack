'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface PlatformSettings {
  monthly_price: number
  trial_days: number
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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    monthly_price: 29.99,
    trial_days: 30,
    stripe_public_key: '',
    stripe_secret_key: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const supabase = createBrowserClient()
    
    const { data } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    if (data) {
      setSettings(data)
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    setSaveMessage('')
    
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('platform_settings')
      .upsert(settings)

    if (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Error saving settings: ' + error.message)
    } else {
      setSaveMessage('Settings saved successfully!')
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000)
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <button
              onClick={() => window.history.back()}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-md ${
              saveMessage.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-600' 
                : 'bg-green-50 border border-green-200 text-green-600'
            }`}>
              {saveMessage}
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            {/* Pricing Settings */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Trial</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.monthly_price}
                    onChange={(e) => setSettings({...settings, monthly_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This price will be shown to users in their settings
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trial Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={settings.trial_days}
                    onChange={(e) => setSettings({...settings, trial_days: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of free trial days for new users
                  </p>
                </div>
              </div>
            </div>

            {/* Stripe Settings */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stripe Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    value={settings.stripe_public_key}
                    onChange={(e) => setSettings({...settings, stripe_public_key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pk_test_..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    value={settings.stripe_secret_key}
                    onChange={(e) => setSettings({...settings, stripe_secret_key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sk_test_..."
                  />
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email (SMTP) Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_user}
                    onChange={(e) => setSettings({...settings, smtp_user: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={settings.smtp_pass}
                    onChange={(e) => setSettings({...settings, smtp_pass: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your SMTP password"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Used for sending email notifications and verification emails
              </p>
            </div>

            {/* Twilio Settings */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Twilio (WhatsApp) Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twilio Account SID
                  </label>
                  <input
                    type="text"
                    value={settings.twilio_account_sid}
                    onChange={(e) => setSettings({...settings, twilio_account_sid: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AC..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twilio Auth Token
                  </label>
                  <input
                    type="password"
                    value={settings.twilio_auth_token}
                    onChange={(e) => setSettings({...settings, twilio_auth_token: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Twilio auth token"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twilio Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.twilio_phone_number}
                    onChange={(e) => setSettings({...settings, twilio_phone_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Used for sending WhatsApp notifications
              </p>
            </div>

            {/* Save Button */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Save Changes</h3>
                  <p className="text-sm text-gray-500">
                    Update platform configuration settings
                  </p>
                </div>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}