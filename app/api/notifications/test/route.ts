import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { reminderService } from '@/lib/reminder-service'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await request.json()

    // This would send a test notification to the current user
    const success = await reminderService.sendImmediateNotification(user.id, {
      id: taskId,
      task_name: 'Test Notification',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    })

    return NextResponse.json({
      success,
      message: success ? 'Test notification sent' : 'Failed to send test notification',
    })
  } catch (error) {
    console.error('Error in test notification API:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}