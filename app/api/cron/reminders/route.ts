import { NextResponse } from 'next/server'
import { reminderService } from '@/lib/reminder-service'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await reminderService.checkAndSendReminders()
    
    return NextResponse.json({
      success: true,
      message: `Reminders processed: ${result.sent} sent, ${result.errors} errors`,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}