'use client'

import { OnboardingData } from '@/types/onboarding'

interface BusinessInfoStepProps {
  data: OnboardingData
  onChange: (data: Partial<OnboardingData>) => void
  errors: string[]
}

export default function BusinessInfoStep({ data, onChange, errors }: BusinessInfoStepProps) {
  const handleChange = (field: keyof OnboardingData, value: any) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your company to get started with compliance tracking.</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            value={data.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
          />
        </div>

        {/* Business Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address *
          </label>
          <input
            type="text"
            value={data.business_address}
            onChange={(e) => handleChange('business_address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Street address"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City"
          />
        </div>

        {/* County */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            County *
          </label>
          <input
            type="text"
            value={data.county}
            onChange={(e) => handleChange('county', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="County"
          />
        </div>

        {/* Eircode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eircode / Postal Code
          </label>
          <input
            type="text"
            value={data.eircode}
            onChange={(e) => handleChange('eircode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Eircode"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={data.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+353 ..."
          />
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Size *
          </label>
          <select
            value={data.company_size}
            onChange={(e) => handleChange('company_size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select company size</option>
            <option value="1-9">Micro (1-9 employees)</option>
            <option value="10-49">Small (10-49 employees)</option>
            <option value="50-249">Medium (50-249 employees)</option>
            <option value="250+">Large (250+ employees)</option>
          </select>
        </div>

        {/* Registration Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Date *
          </label>
          <input
            type="date"
            value={data.registration_date}
            onChange={(e) => handleChange('registration_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}