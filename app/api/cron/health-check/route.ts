import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // Check for secret token for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Test database connection
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('monthly_price')
      .limit(1)

    if (error) {
      throw new Error(`Database health check failed: ${error.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Health check passed',
      database: 'connected',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
