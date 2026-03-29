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
    return {
      success: false,
      error: 'Twilio credentials not configured in platform settings'
    }
  }

  try {
    // Use Twilio API directly via fetch (no need for SDK)
    const accountSid = config.twilio_account_sid
    const authToken = config.twilio_auth_token
    const fromNumber = config.twilio_phone_number

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'From': `whatsapp:${fromNumber}`,
          'To': `whatsapp:${to}`,
          'Body': message,
        }).toString(),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio error:', data)
      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp message'
      }
    }

    return {
      success: true,
      messageId: data.sid,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending message'
    }
  }
}