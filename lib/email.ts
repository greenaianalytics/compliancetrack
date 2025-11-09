import { createServerClient } from './supabase'

export async function getEmailConfig() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('smtp_host, smtp_port, smtp_user, smtp_pass')
    .single()
  
  return data
}

export async function sendEmail(to: string, subject: string, html: string) {
  const config = await getEmailConfig()
  
  if (!config?.smtp_host) {
    console.error('SMTP not configured')
    return false
  }

  // Implementation using nodemailer or your email service
  // This will use the admin-configured SMTP settings
}