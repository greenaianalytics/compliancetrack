import { createBrowserClient } from './supabase'

export async function sendSMS(to: string, message: string) {
  const supabase = createBrowserClient()
  
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('*')
    .single()

  if (!settings?.elks_username || !settings?.elks_password) {
    console.error('46elks credentials not configured')
    return { success: false, error: 'SMS service not configured' }
  }

  try {
    // Basic authentication for 46elks
    const auth = Buffer.from(`${settings.elks_username}:${settings.elks_password}`).toString('base64')
    
    const response = await fetch('https://api.46elks.com/a1/SMS', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: settings.elks_sender || 'ComplianceTrack',
        to: to,
        message: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`46elks error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('SMS sent successfully:', data.id)
    return { success: true, id: data.id }
  } catch (error) {
    console.error('46elks error:', error)
    return { success: false, error: error.message }
  }
}

// SMS templates
export const smsTemplates = {
  taskReminder: (taskName: string, dueDate: string) => 
    `Reminder: ${taskName} due on ${dueDate}. Log in to Compliance Track to complete.`,

  urgentTask: (taskName: string) =>
    `URGENT: ${taskName} is due today. Please complete immediately.`,

  welcome: () =>
    `Welcome to Compliance Track! Your account is ready. Log in to get started.`
}
