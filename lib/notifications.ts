import { createServerClient } from './supabase'

export async function getTwilioConfig() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
    .single()
  
  return data
}

export async function sendWhatsAppMessage(to: string, message: string) {
  const config = await getTwilioConfig()
  
  if (!config?.twilio_account_sid) {
    console.error('Twilio not configured')
    return false
  }

  // Implementation using Twilio SDK
  // This will use the admin-configured Twilio settings
}