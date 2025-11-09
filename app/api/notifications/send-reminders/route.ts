import { NextResponse } from 'next/server'
import { reminderService } from '@/lib/reminder-service'

// This would be called by a cron job
export async function GET() {
  try {
    // Add basic authentication for cron job
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await reminderService.checkAndSendReminders()
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in send-reminders API:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}