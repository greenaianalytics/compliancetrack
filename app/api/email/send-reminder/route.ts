import { NextRequest, NextResponse } from 'next/server'
import { getEmailConfig } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const config = await getEmailConfig()
    
    if (!config.smtp_host) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Use the admin-configured SMTP settings
    // Send email using nodemailer with config
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}