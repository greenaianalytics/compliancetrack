'use client'

import { useState } from 'react'
import { NotificationSettings } from '@/types/settings'

interface NotificationSettingsProps {
  settings: NotificationSettings
  onSave: (settings: NotificationSettings) => Promise<void>
}

export default function NotificationSettingsForm({ settings, onSave }: NotificationSettingsProps) {
  const [formData, setFormData] = useState<NotificationSettings>(settings)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (field: keyof NotificationSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleToggle = (field: 'email_enabled' | 'whatsapp_enabled') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleReminderDaysChange = (days: number, checked: boolean) => {
    const newDays = checked
      ? [...formData.reminder_lead_days, days].sort((a, b) => a - b)
      : formData.reminder_lead_days.filter(d => d !== days)
    
    handleChange('reminder_lead_days', newDays)
  }

  const handleTestNotification = async (type: 'email' | 'whatsapp') => {
    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          email: type === 'email' ? formData.email_address : undefined,
          whatsappNumber: type === 'whatsapp' ? formData.whatsapp_number : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: `Test ${type} notification sent successfully!` })
      } else {
        setMessage({ type: 'error', text: `Failed to send test ${type} notification` })
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error sending test ${type} notification` })
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await onSave(formData)
      setMessage({ type: 'success', text: 'Notification settings updated successfully!' })
    } catch (error) {
      console.error('Error saving notification settings:', error)
      setMessage({ type: 'error', text: 'Failed to update notification settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure how and when you receive compliance reminders.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive compliance reminders via email</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleTestNotification('email')}
                disabled={testing || !formData.email_enabled || !formData.email_address}
                className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50"
              >
                {testing ? 'Sending...' : 'Test Email'}
              </button>
              <button
                type="button"
                onClick={() => handleToggle('email_enabled')}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${formData.email_enabled ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${formData.email_enabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {formData.email_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email_address}
                onChange={(e) => handleChange('email_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
        </div>

        {/* WhatsApp Notifications */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">WhatsApp Notifications</h3>
              <p className="text-sm text-gray-600">Receive compliance reminders via WhatsApp</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleTestNotification('whatsapp')}
                disabled={testing || !formData.whatsapp_enabled || !formData.whatsapp_number}
                className="px-3 py-1 text-sm text-green-600 border border-green-300 rounded-md hover:bg-green-50 disabled:opacity-50"
              >
                {testing ? 'Sending...' : 'Test WhatsApp'}
              </button>
              <button
                type="button"
                onClick={() => handleToggle('whatsapp_enabled')}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${formData.whatsapp_enabled ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${formData.whatsapp_enabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {formData.whatsapp_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+353 ..."
                required
              />
            </div>
          )}
        </div>

        {/* Reminder Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reminder Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send reminders before due date:
              </label>
              <div className="flex flex-wrap gap-4">
                {[1, 3, 7, 14].map(days => (
                  <label key={days} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.reminder_lead_days.includes(days)}
                      onChange={(e) => handleReminderDaysChange(days, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {days} day{days !== 1 ? 's' : ''} before
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={formData.quiet_hours_start}
                  onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={formData.quiet_hours_end}
                  onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Notifications will not be sent during quiet hours.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}