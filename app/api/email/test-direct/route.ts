// app/api/email/test-direct/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== DIRECT RESEND TEST ===')
  
  try {
    // Get Resend API key from database
    const supabase = createServerClient()
    const { data: settings, error: dbError } = await supabase
      .from('platform_settings')
      .select('resend_api_key, email_from_address, email_from_name')
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: 'Database error',
        details: dbError.message 
      })
    }
    
    if (!settings?.resend_api_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'No Resend API key configured' 
      })
    }
    
    console.log('Resend key found, length:', settings.resend_api_key.length)
    console.log('From:', `${settings.email_from_name} <${settings.email_from_address}>`)
    
    // Try to send email via Resend
    const fromAddress = `${settings.email_from_name} <${settings.email_from_address}>`
    const toEmail = 'zamils.khan@gmail.com'
    
    console.log('Sending to:', toEmail)
    console.log('Using Resend API key starting with:', settings.resend_api_key.substring(0, 10) + '...')
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.resend_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: 'Direct Test from Compliance Track',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Compliance Track - Direct Test</h2>
            <p>This is a direct test email sent via Resend API.</p>
            <p>If you receive this, your email configuration is working!</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    })
    
    console.log('Resend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error response:', errorText)
      return NextResponse.json({
        success: false,
        error: `Resend API error: ${response.status}`,
        details: errorText
      }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Resend success! ID:', data.id)
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via Resend',
      emailId: data.id,
      to: toEmail,
      from: fromAddress,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('=== DIRECT TEST ERROR ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Check for specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Fetch API might not be available in this environment')
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
