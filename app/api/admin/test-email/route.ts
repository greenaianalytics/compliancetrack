import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get admin user email for test
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'No user found' })
    }

    const result = await sendEmail(
      user.email,
      'Compliance Track - Test Email',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email from Compliance Track</h2>
          <p>This is a test email to verify your Resend configuration.</p>
          <p>If you're receiving this, your email service is working correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    )

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Test email sent successfully' })
    } else {
      return NextResponse.json({ success: false, error: result.error })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
