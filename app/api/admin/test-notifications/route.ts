import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendEmail, emailTemplates } from '@/lib/email'
import { sendSMS, smsTemplates } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'No authenticated user found' })
    }

    // Get platform settings
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    const results = {
      email: { success: false, error: null, details: null },
      sms: { success: false, error: null, details: null }
    }

    // Test Email (Resend)
    if (settings?.resend_api_key) {
      try {
        const emailResult = await sendEmail(
          user.email,
          'Compliance Track - Notification Test',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Notification Test Successful!</h2>
              <p>This is a test email to verify your Resend configuration.</p>
              <p><strong>Service:</strong> Resend</p>
              <p><strong>From Domain:</strong> ${settings.email_from_address}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p>If you're receiving this, your email service is working correctly!</p>
            </div>
          `
        )
        
        results.email = {
          success: emailResult.success,
          error: emailResult.error,
          details: emailResult.id ? { id: emailResult.id } : null
        }
      } catch (error: any) {
        results.email.error = error.message
      }
    } else {
      results.email.error = 'Resend API key not configured'
    }

    // Test SMS (46elks)
    if (settings?.elks_username && settings?.elks_password) {
      try {
        // Test authentication first
        const auth = Buffer.from(`${settings.elks_username}:${settings.elks_password}`).toString('base64')
        const authTest = await fetch('https://api.46elks.com/a1/Me', {
          headers: { 'Authorization': `Basic ${auth}` },
        })

        if (authTest.ok) {
          // Get test phone number from request body or use demo
          const body = await request.json()
          const testPhoneNumber = body.phoneNumber || '+46700000000' // Swedish test number
          
          const smsResult = await sendSMS(
            testPhoneNumber,
            'Test SMS from Compliance Track. Configuration verified successfully!'
          )
          
          results.sms = {
            success: smsResult.success,
            error: smsResult.error,
            details: smsResult.id ? { id: smsResult.id } : null
          }
        } else {
          results.sms.error = '46elks authentication failed'
        }
      } catch (error: any) {
        results.sms.error = error.message
      }
    } else {
      results.sms.error = '46elks credentials not configured'
    }

    return NextResponse.json({ 
      success: results.email.success || results.sms.success,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Test notification error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
