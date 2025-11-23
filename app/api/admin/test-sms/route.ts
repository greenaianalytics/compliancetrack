import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    // For testing, we'll just verify credentials work
    // Actual SMS would require a phone number
    const supabase = createServerClient()
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('elks_username, elks_password')
      .single()

    if (!settings?.elks_username || !settings?.elks_password) {
      return NextResponse.json({ success: false, error: '46elks credentials not configured' })
    }

    // Test authentication by making a balance check request
    const auth = Buffer.from(`${settings.elks_username}:${settings.elks_password}`).toString('base64')
    const response = await fetch('https://api.46elks.com/a1/Me', {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: '46elks credentials verified successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to authenticate with 46elks' 
      })
    }
  } catch (error) {
    console.error('Test SMS error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
