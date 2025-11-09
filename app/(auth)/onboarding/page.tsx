'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createSMEProfile, completeOnboarding } from '@/lib/onboarding-api'
import { OnboardingData } from '@/types/onboarding'
import { validateBusinessInfo, validateCountryNace } from '@/lib/onboarding-utils'
import BusinessInfoStep from '@/components/onboarding/step-business-info'
import CountryNaceStep from '@/components/onboarding/step-country-nace'
import TeamInvitesStep from '@/components/onboarding/step-team-invites'

const STEPS = [
  { id: 'business', title: 'Business Info' },
  { id: 'classification', title: 'Classification' },
  { id: 'team', title: 'Team' },
  { id: 'complete', title: 'Complete' },
]

const INITIAL_DATA: OnboardingData = {
  business_name: '',
  business_address: '',
  city: '',
  county: '',
  eircode: '',
  phone_number: '',
  company_size: '',
  registration_date: '',
  country_code: '',
  nace_code: '',
  nace_description: '',
  team_members: [],
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(INITIAL_DATA)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }))
  }

  const validateStep = (step: number): boolean => {
    let stepErrors: string[] = []
    
    switch (step) {
      case 0: // Business Info
        stepErrors = validateBusinessInfo(onboardingData)
        break
      case 1: // Country & NACE
        stepErrors = validateCountryNace(onboardingData)
        break
      case 2: // Team (optional, no validation needed)
        break
    }
    
    setErrors(stepErrors)
    return stepErrors.length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setErrors([])
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      // Create SME profile
      await createSMEProfile(user.id, onboardingData)
      
      // Mark onboarding as complete
      await completeOnboarding(user.id)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setErrors(['Failed to save your information. Please try again.'])
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BusinessInfoStep
            data={onboardingData}
            onChange={updateOnboardingData}
            errors={errors}
          />
        )
      case 1:
        return (
          <CountryNaceStep
            data={onboardingData}
            onChange={updateOnboardingData}
            errors={errors}
          />
        )
      case 2:
        return (
          <TeamInvitesStep
            data={onboardingData}
            onChange={updateOnboardingData}
          />
        )
      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your compliance tasks are being generated based on your business information. 
              You'll be redirected to your dashboard where you can start managing your compliance requirements.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Compliance tasks generated based on your NACE code</li>
                <li>• Access to country-specific knowledge base</li>
                <li>• Team invitations sent (if added)</li>
                <li>• 30-day free trial started</li>
              </ul>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compliance Track
          </h1>
          <p className="text-gray-600">Complete your setup to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                    ${index === currentStep ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                  `}
                >
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2
                      ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step, index) => (
              <span
                key={step.id}
                className={`
                  text-xs font-medium
                  ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}