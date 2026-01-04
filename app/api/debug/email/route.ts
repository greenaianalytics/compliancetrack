// app/api/debug/email/route.ts - UPDATED WITH NEW COLUMNS
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG EMAIL CONFIGURATION ===')
    
    const supabase = createServerClient()
    
    // Get ALL settings
    const { data: settings, error: dbError } = await supabase
      .from('platform_settings')
      .select('*')
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: dbError.message,
        hint: dbError.hint
      })
    }
    
    console.log('Full settings from DB:', JSON.stringify(settings, null, 2))
    
    // Check configuration status
    const configStatus = {
      // Email - Resend
      hasResend: !!settings?.resend_api_key,
      resendKeyPreview: settings?.resend_api_key ? 
        `***${settings.resend_api_key.slice(-4)}` : 'Not set',
      
      // Email - SMTP
      hasSmtpHost: !!settings?.smtp_host,
      hasSmtpUser: !!settings?.smtp_user,
      hasSmtpPass: !!settings?.smtp_pass,
      smtpPort: settings?.smtp_port || 'Not set',
      smtpSecure: settings?.smtp_secure ? 'Yes' : 'No',
      
      // Email - From info
      fromAddress: settings?.email_from_address || 'Not set',
      fromName: settings?.email_from_name || 'Not set',
      
      // SMS - 46elks
      hasElks: !!(settings?.elks_username && settings?.elks_password),
      elksSender: settings?.elks_sender || 'Not set',
      
      // SMS - Plivo (alternative)
      hasPlivo: !!(settings?.plivo_auth_id && settings?.plivo_auth_token)
    }
    
    // Check environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // Email env vars
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
      SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not set',
      SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
      SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Not set',
      // SMS env vars
      ELKS_USERNAME: process.env.ELKS_USERNAME ? 'Set' : 'Not set',
      ELKS_PASSWORD: process.env.ELKS_PASSWORD ? 'Set' : 'Not set'
    }
    
    // Determine available services
    const availableServices = {
      emailResend: configStatus.hasResend || envVars.RESEND_API_KEY !== 'Not set',
      emailSMTP: (configStatus.hasSmtpHost && configStatus.hasSmtpUser && configStatus.hasSmtpPass) ||
                 (envVars.SMTP_HOST !== 'Not set' && envVars.SMTP_USER !== 'Not set' && envVars.SMTP_PASS !== 'Not set'),
      smsElks: configStatus.hasElks || (envVars.ELKS_USERNAME !== 'Not set' && envVars.ELKS_PASSWORD !== 'Not set'),
      smsPlivo: configStatus.hasPlivo
    }
    
    console.log('Configuration status:', configStatus)
    console.log('Available services:', availableServices)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        settings: configStatus,
        availableServices: availableServices,
        // Show non-sensitive data
        sampleData: {
          from: `${settings?.email_from_name} <${settings?.email_from_address}>`,
          smtpConfigured: configStatus.hasSmtpHost && configStatus.hasSmtpUser && configStatus.hasSmtpPass,
          smtpHost: settings?.smtp_host || 'Not set',
          smtpPort: settings?.smtp_port || 'Not set'
        }
      },
      environment: envVars,
      recommendations: getRecommendations(configStatus, availableServices)
    })
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getRecommendations(configStatus: any, availableServices: any): string[] {
  const recommendations = []
  
  if (!availableServices.emailResend && !availableServices.emailSMTP) {
    recommendations.push('Configure email service: Add Resend API key or SMTP credentials to platform_settings table')
  }
  
  if (availableServices.emailSMTP && !configStatus.smtpPort) {
    recommendations.push('Set SMTP port (default is 587) in platform_settings.smtp_port')
  }
  
  if (availableServices.emailSMTP && configStatus.smtpSecure === 'Not set') {
    recommendations.push('Set SMTP secure flag in platform_settings.smtp_secure (true for port 465, false for 587)')
  }
  
  if (!configStatus.fromAddress || configStatus.fromAddress === 'Not set') {
    recommendations.push('Set email_from_address in platform_settings (e.g., noreply@notification.greenaianalytics.org)')
  }
  
  return recommendations
}
