'use client'

import { useState } from 'react'

interface TestResults {
  email: { success: boolean; error: string | null; details: any }
  sms: { success: boolean; error: string | null; details: any }
}

export default function TestNotifications() {
  const [testing, setTesting] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [results, setResults] = useState<TestResults | null>(null)

  const runTests = async () => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Notifications</h3>
      
      <div className="space-y-4">
        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+46700000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to test only authentication. Use a real number to test actual SMS delivery.
          </p>
        </div>

        {/* Test Button */}
        <button
          onClick={runTests}
          disabled={testing}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Run Notification Tests'}
        </button>

        {/* Results */}
        {results && (
          <div className="mt-4 space-y-4">
            {/* Email Results */}
            <div className={`p-4 rounded-md ${results.email.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Email Test (Resend)</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${results.email.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {results.email.success ? '✓ Success' : '✗ Failed'}
                </span>
              </div>
              {results.email.error && (
                <p className="text-sm text-red-600 mt-2">{results.email.error}</p>
              )}
              {results.email.details && (
                <p className="text-sm text-green-600 mt-2">Email ID: {results.email.details.id}</p>
              )}
            </div>

            {/* SMS Results */}
            <div className={`p-4 rounded-md ${results.sms.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">SMS Test (46elks)</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${results.sms.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {results.sms.success ? '✓ Success' : '✗ Failed'}
                </span>
              </div>
              {results.sms.error && (
                <p className="text-sm text-red-600 mt-2">{results.sms.error}</p>
              )}
              {results.sms.details && (
                <p className="text-sm text-green-600 mt-2">SMS ID: {results.sms.details.id}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
