'use client'

import { useState } from 'react'
import { BusinessSettings } from '@/types/settings'
import { COUNTRIES, getNaceCodesByCountry } from '@/lib/onboarding-utils'

interface BusinessSettingsProps {
  settings: BusinessSettings
  onSave: (settings: BusinessSettings) => Promise<void>
}

export default function BusinessSettingsForm({ settings, onSave }: BusinessSettingsProps) {
  const [formData, setFormData] = useState<BusinessSettings>(settings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const naceCodes = getNaceCodesByCountry(formData.country_code)

  const handleChange = (field: keyof BusinessSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await onSave(formData)
      setMessage({ type: 'success', text: 'Business settings updated successfully!' })
    } catch (error) {
      console.error('Error saving business settings:', error)
      setMessage({ type: 'error', text: 'Failed to update business settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Business Profile</h2>
        <p className="text-sm text-gray-600 mt-1">
          Update your company information and business classification.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => handleChange('business_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Business Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Address *
            </label>
            <input
              type="text"
              value={formData.business_address}
              onChange={(e) => handleChange('business_address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* County */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County *
            </label>
            <input
              type="text"
              value={formData.county}
              onChange={(e) => handleChange('county', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Eircode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eircode / Postal Code
            </label>
            <input
              type="text"
              value={formData.eircode}
              onChange={(e) => handleChange('eircode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size *
            </label>
            <select
              value={formData.company_size}
              onChange={(e) => handleChange('company_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select company size</option>
              <option value="1-9">Micro (1-9 employees)</option>
              <option value="10-49">Small (10-49 employees)</option>
              <option value="50-249">Medium (50-249 employees)</option>
              <option value="250+">Large (250+ employees)</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              value={formData.country_code}
              onChange={(e) => {
                handleChange('country_code', e.target.value)
                handleChange('nace_code', '') // Reset NACE when country changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select country</option>
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* NACE Code */}
          {formData.country_code && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Activity (NACE Code) *
              </label>
              <select
                value={formData.nace_code}
                onChange={(e) => handleChange('nace_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select business activity</option>
                {naceCodes.map(nace => (
                  <option key={nace.code} value={nace.code}>
                    {nace.code} - {nace.description}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}