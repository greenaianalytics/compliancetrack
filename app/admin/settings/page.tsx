'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface PlatformSettings {
  monthly_price: number
  stripe_public_key: string
  stripe_secret_key: string
  
  // Email Configuration - Resend
  email_provider: 'resend'
  email_from_name: string
  email_from_address: string
  resend_api_key: string
  
  // SMS Configuration - 46elks
  sms_provider: '46elks'
  elks_username: string
  elks_password: string
  elks_sender: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    monthly_price: 29.99,
    stripe_public_key: '',
    stripe_secret_key: '',
    
    // Email - Resend
    email_provider: 'resend',
    email_from_name: 'Compliance Track',
    email_from_address: 'noreply@notification.greenaianalytics.org',
    resend_api_key: '',
    
    // SMS - 46elks
    sms_provider: '46elks',
    elks_username: '',
    elks_password: '',
    elks_sender: 'ComplianceTrack'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testStatus, setTestStatus] = useState<{email?: string, sms?: string}>({})

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
    
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('platform_settings')
      .upsert(settings)

    if (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } else {
      alert('Settings saved successfully!')
    }
    
    setSaving(false)
  }

  const testEmail = async () => {
    setTestStatus({...testStatus, email: 'testing'})
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      if (result.success) {
        setTestStatus({...testStatus, email: 'success'})
      } else {
        setTestStatus({...testStatus, email: 'error'})
      }
    } catch (error) {
      setTestStatus({...testStatus, email: 'error'})
    }
  }

  const testSMS = async () => {
    setTestStatus({...testStatus, sms: 'testing'})
    try {
      const response = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      if (result.success) {
        setTestStatus({...testStatus, sms: 'success'})
      } else {
        setTestStatus({...testStatus, sms: 'error'})
      }
    } catch (error) {
      setTestStatus({...testStatus, sms: 'error'})
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <button onClick={() => window.history.back()} className="text-sm text-blue-600">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
            
            {/* Pricing Settings */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.monthly_price}
                    onChange={(e) => setSettings({...settings, monthly_price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Settings - Resend Only */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Email Configuration <span className="text-green-600">✓ Resend</span>
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email_from_name}
                      onChange={(e) => setSettings({...settings, email_from_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Address
                    </label>
                    <input
                      type="email"
                      value={settings.email_from_address}
                      onChange={(e) => setSettings({...settings, email_from_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resend API Key
                  </label>
                  <input
                    type="password"
                    value={settings.resend_api_key}
                    onChange={(e) => setSettings({...settings, resend_api_key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="re_..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from Resend dashboard
                  </p>
                </div>

                {/* Test Email Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={testEmail}
                    disabled={saving || !settings.resend_api_key}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {testStatus.email === 'testing' ? 'Testing...' : 
                     testStatus.email === 'success' ? '✓ Email Test Successful' :
                     testStatus.email === 'error' ? '✗ Email Test Failed' : 
                     'Test Email Configuration'}
                  </button>
                </div>
              </div>
            </div>

            {/* SMS Settings - 46elks Only */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SMS Configuration <span className="text-green-600">✓ 46elks</span>
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">46elks Username</label>
                    <input
                      type="text"
                      value={settings.elks_username}
                      onChange={(e) => setSettings({...settings, elks_username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">46elks Password</label>
                    <input
                      type="password"
                      value={settings.elks_password}
                      onChange={(e) => setSettings({...settings, elks_password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={settings.elks_sender}
                    onChange={(e) => setSettings({...settings, elks_sender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ComplianceTrack"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alphanumeric sender ID (max 11 characters)
                  </p>
                </div>

                {/* Test SMS Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={testSMS}
                    disabled={saving || !settings.elks_username || !settings.elks_password}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {testStatus.sms === 'testing' ? 'Testing...' : 
                     testStatus.sms === 'success' ? '✓ SMS Test Successful' :
                     testStatus.sms === 'error' ? '✗ SMS Test Failed' : 
                     'Test SMS Configuration'}
                  </button>
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
                    placeholder="pk_live_..."
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
                    placeholder="sk_live_..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="p-6">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
