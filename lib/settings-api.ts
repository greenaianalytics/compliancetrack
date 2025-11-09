import { createBrowserClient } from './supabase'
import { BusinessSettings, NotificationSettings, SettingsData } from '@/types/settings'

export const getSMESettings = async (userId: string): Promise<SettingsData | null> => {
  const supabase = createBrowserClient()
  
  // Get SME profile
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError || !smeProfile) {
    console.error('Error loading SME profile:', profileError)
    return null
  }

  // Get notification preferences
  const { data: notificationPrefs, error: notifError } = await supabase
    .from('sme_notification_preferences')
    .select('*')
    .eq('sme_id', smeProfile.id)
    .single()

  // Parse business address
  const addressParts = smeProfile.business_address?.split(', ') || []
  const business_address = addressParts[0] || ''
  const city = addressParts[1] || ''
  const county = addressParts[2] || ''
  const eircode = addressParts[3] || ''

  return {
    business: {
      business_name: smeProfile.business_name || '',
      business_address,
      city,
      county,
      eircode,
      phone_number: smeProfile.phone_number || '',
      company_size: smeProfile.company_size || '',
      country_code: smeProfile.country_code || 'IE',
      nace_code: smeProfile.nace_codes?.[0] || '',
    },
    notifications: notificationPrefs ? {
      email_enabled: notificationPrefs.email_enabled ?? true,
      whatsapp_enabled: notificationPrefs.whatsapp_enabled ?? false,
      email_address: notificationPrefs.email_address || '',
      whatsapp_number: notificationPrefs.whatsapp_number || '',
      reminder_lead_days: notificationPrefs.reminder_lead_days || [7, 3, 1],
      quiet_hours_start: notificationPrefs.quiet_hours_start || '20:00:00',
      quiet_hours_end: notificationPrefs.quiet_hours_end || '08:00:00',
    } : {
      email_enabled: true,
      whatsapp_enabled: false,
      email_address: '',
      whatsapp_number: '',
      reminder_lead_days: [7, 3, 1],
      quiet_hours_start: '20:00:00',
      quiet_hours_end: '08:00:00',
    },
    payment: {
      subscription_status: 'trial', // You'll want to get this from your billing system
      subscription_type: 'free',
      billing_email: '',
    }
  }
}

export const updateBusinessSettings = async (userId: string, settings: BusinessSettings) => {
  const supabase = createBrowserClient()
  
  // Get current SME profile to get the ID
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (profileError || !smeProfile) {
    throw new Error('SME profile not found')
  }

  const fullAddress = `${settings.business_address}, ${settings.city}, ${settings.county}, ${settings.eircode}`

  const { error } = await supabase
    .from('sme_profiles')
    .update({
      business_name: settings.business_name,
      business_address: fullAddress,
      phone_number: settings.phone_number,
      company_size: settings.company_size,
      nace_codes: settings.nace_code ? [settings.nace_code] : [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', smeProfile.id)

  if (error) {
    throw new Error(`Failed to update business settings: ${error.message}`)
  }

  return { success: true }
}

export const updateNotificationSettings = async (userId: string, settings: NotificationSettings) => {
  const supabase = createBrowserClient()
  
  // Get current SME profile to get the ID
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (profileError || !smeProfile) {
    throw new Error('SME profile not found')
  }

  // Check if notification preferences exist
  const { data: existingPrefs } = await supabase
    .from('sme_notification_preferences')
    .select('id')
    .eq('sme_id', smeProfile.id)
    .single()

  const notificationData = {
    sme_id: smeProfile.id,
    email_enabled: settings.email_enabled,
    whatsapp_enabled: settings.whatsapp_enabled,
    email_address: settings.email_address,
    whatsapp_number: settings.whatsapp_number,
    reminder_lead_days: settings.reminder_lead_days,
    quiet_hours_start: settings.quiet_hours_start,
    quiet_hours_end: settings.quiet_hours_end,
    updated_at: new Date().toISOString(),
  }

  let error
  if (existingPrefs) {
    // Update existing
    const { error: updateError } = await supabase
      .from('sme_notification_preferences')
      .update(notificationData)
      .eq('sme_id', smeProfile.id)
    error = updateError
  } else {
    // Create new
    const { error: insertError } = await supabase
      .from('sme_notification_preferences')
      .insert([notificationData])
    error = insertError
  }

  if (error) {
    throw new Error(`Failed to update notification settings: ${error.message}`)
  }

  return { success: true }
}