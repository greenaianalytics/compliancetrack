'use client'

import { OnboardingData, NaceCode } from '@/types/onboarding'
import { COUNTRIES, getNaceCodesByCountry } from '@/lib/onboarding-utils'

interface CountryNaceStepProps {
  data: OnboardingData
  onChange: (data: Partial<OnboardingData>) => void
  errors: string[]
}

export default function CountryNaceStep({ data, onChange, errors }: CountryNaceStepProps) {
  const naceCodes = getNaceCodesByCountry(data.country_code)
  const selectedNace = naceCodes.find(nace => nace.code === data.nace_code)

  const handleChange = (field: keyof OnboardingData, value: any) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Classification</h2>
        <p className="text-gray-600">Select your country and business activity to generate relevant compliance tasks.</p>
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

      <div className="space-y-6">
        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country of Operation *
          </label>
          <select
            value={data.country_code}
            onChange={(e) => {
              handleChange('country_code', e.target.value)
              handleChange('nace_code', '') // Reset NACE when country changes
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your country</option>
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* NACE Code Selection */}
        {data.country_code && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Activity (NACE Code) *
            </label>
            <select
              value={data.nace_code}
              onChange={(e) => {
                const selected = naceCodes.find(nace => nace.code === e.target.value)
                handleChange('nace_code', e.target.value)
                handleChange('nace_description', selected?.description || '')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your business activity</option>
              {naceCodes.map(nace => (
                <option key={nace.code} value={nace.code}>
                  {nace.code} - {nace.description}
                </option>
              ))}
            </select>
            
            {selectedNace && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedNace.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Information Box */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Why do we need this?</h3>
          <p className="text-sm text-gray-600">
            Your NACE code determines which compliance requirements apply to your specific industry. 
            This ensures you only see relevant tasks and regulations for your business type.
          </p>
        </div>
      </div>
    </div>
  )
}