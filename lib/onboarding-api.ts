import { createBrowserClient } from './supabase'
import { OnboardingData } from '@/types/onboarding'

export const createSMEProfile = async (userId: string, data: OnboardingData) => {
  const supabase = createBrowserClient()
  
  // Create SME profile
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .insert([
      {
        user_id: userId,
        business_name: data.business_name,
        business_address: `${data.business_address}, ${data.city}, ${data.county}, ${data.eircode}`,
        country_code: data.country_code,
        phone_number: data.phone_number,
        nace_codes: [data.nace_code],
        company_size: data.company_size,
        dashboard_start_date: data.registration_date,
      }
    ])
    .select()
    .single()

  if (profileError) {
    throw new Error(`Failed to create SME profile: ${profileError.message}`)
  }

  // Create team members if any
  if (data.team_members && data.team_members.length > 0) {
    // Here you would typically send invitation emails
    // For now, we'll just log them
    console.log('Team members to invite:', data.team_members)
  }

  return smeProfile
}

export const completeOnboarding = async (userId: string) => {
  const supabase = createBrowserClient()
  
  // You might want to mark the user as having completed onboarding
  // This could be stored in a user_metadata field or a separate table
  const { error } = await supabase
    .from('users')
    .update({ 
      // You can add an onboarding_completed field if needed
    })
    .eq('id', userId)

  if (error) {
    console.error('Error marking onboarding complete:', error)
  }
}