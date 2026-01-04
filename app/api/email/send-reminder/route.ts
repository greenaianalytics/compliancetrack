// app/api/email/send-reminder/route.ts - WORKING VERSION
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== SEND REMINDER ENDPOINT ===')
  
  try {
    // Parse request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const { to, taskName, dueDate, userName } = body
    
    // Validation
    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to (email address)' },
        { status: 400 }
      )
    }
    
    // Get email configuration
    const supabase = createServerClient()
    const { data: settings, error: dbError } = await supabase
      .from('platform_settings')
      .select('resend_api_key, email_from_address, email_from_name')
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }
    
    if (!settings?.resend_api_key) {
      console.error('No Resend API key configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
    console.log('Resend API key available, sending email...')
    
    // Send email via Resend
    const fromAddress = `${settings.email_from_name} <${settings.email_from_address}>`
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.resend_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: `Compliance Track: ${taskName || 'Task'} due on ${dueDate || 'soon'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0;">Compliance Track</h2>
              <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
            </div>
            <p>Hello ${userName || 'User'},</p>
            <p>This is a reminder that your compliance task <strong>${taskName || 'Your task'}</strong> is due on <strong>${dueDate || 'soon'}</strong>.</p>
            <p>Please log in to your dashboard to complete this task.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
              <p style="margin: 0;"><strong>Task:</strong> ${taskName || 'Not specified'}</p>
              <p style="margin: 0;"><strong>Due Date:</strong> ${dueDate || 'Not specified'}</p>
              <p style="margin: 0;"><strong>Assigned to:</strong> ${userName || 'Not specified'}</p>
            </div>
            <p style="margin-top: 20px; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This email was sent from Compliance Track by GreenAI Analytics.
              </p>
            </div>
          </div>
        `,
      }),
    })
    
    console.log('Resend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', errorText)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send email via Resend',
          details: errorText
        },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    console.log('Email sent successfully, ID:', data.id)
    
    return NextResponse.json({
      success: true,
      message: 'Reminder email sent successfully',
      emailId: data.id,
      to: to,
      from: fromAddress,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('=== SEND REMINDER ERROR ===')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
