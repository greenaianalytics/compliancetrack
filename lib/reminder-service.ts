import { createServerClient } from './supabase'
import { emailService } from './email-service'
import { smsService } from './sms-service'
import { TaskReminder, NotificationPreference } from '@/types/notifications'

export class ReminderService {
  private supabase = createServerClient()

  async checkAndSendReminders(): Promise<{ sent: number; errors: number }> {
    console.log('🔔 Starting reminder check...')
    
    let sentCount = 0
    let errorCount = 0

    try {
      // Get all pending tasks with their user preferences
      const { data: tasks, error } = await this.supabase
        .from('sme_compliance_status')
        .select(`
          id,
          due_date,
          status,
          sme_profiles!inner(
            id,
            business_name,
            sme_notification_preferences(
              email_enabled,
              whatsapp_enabled,
              email_address,
              whatsapp_number,
              reminder_lead_days,
              quiet_hours_start,
              quiet_hours_end
            ),
            users(
              id,
              email
            )
          ),
          compliance_tasks(
            task_name,
            description
          )
        `)
        .eq('status', 'pending')
        .not('due_date', 'is', null)

      if (error) {
        console.error('Error fetching tasks for reminders:', error)
        return { sent: 0, errors: 1 }
      }

      if (!tasks || tasks.length === 0) {
        console.log('No tasks found for reminders')
        return { sent: 0, errors: 0 }
      }

      const now = new Date()
      const currentHour = now.getHours()

      for (const task of tasks) {
        if (!task.compliance_tasks || !task.sme_profiles) continue

        const dueDate = new Date(task.due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        const preferences = task.sme_profiles.sme_notification_preferences?.[0]
        const userEmail = task.sme_profiles.users?.email

        if (!preferences || !userEmail) continue

        // Check if we're in quiet hours
        const quietStart = parseInt(preferences.quiet_hours_start?.split(':')[0] || '20')
        const quietEnd = parseInt(preferences.quiet_hours_end?.split(':')[0] || '8')
        
        const isQuietHours = this.isQuietHours(currentHour, quietStart, quietEnd)
        if (isQuietHours) {
          console.log(`Skipping reminder during quiet hours (${currentHour}h)`)
          continue
        }

        // Check if this is a reminder day
        const reminderDays = preferences.reminder_lead_days || [7, 3, 1]
        const shouldSendReminder = reminderDays.includes(daysUntilDue) || daysUntilDue < 0

        if (shouldSendReminder) {
          const taskReminder: TaskReminder = {
            task_id: task.id,
            task_name: task.compliance_tasks.task_name,
            due_date: task.due_date,
            user_email: userEmail,
            user_phone: preferences.whatsapp_number,
            days_until_due: daysUntilDue,
            reminder_type: daysUntilDue < 0 ? 'overdue' : 'due_date',
          }

          // Send notifications based on preferences
          const results = await this.sendNotifications(taskReminder, preferences)
          
          if (results.emailSent) sentCount++
          else if (preferences.email_enabled) errorCount++
          
          if (results.smsSent) sentCount++
          else if (preferences.whatsapp_enabled) errorCount++

          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`✅ Reminder check completed: ${sentCount} sent, ${errorCount} errors`)
      return { sent: sentCount, errors: errorCount }

    } catch (error) {
      console.error('Error in reminder service:', error)
      return { sent: sentCount, errors: errorCount + 1 }
    }
  }

  private isQuietHours(currentHour: number, quietStart: number, quietEnd: number): boolean {
    if (quietStart <= quietEnd) {
      return currentHour >= quietStart && currentHour < quietEnd
    } else {
      // Handle overnight quiet hours (e.g., 20:00 to 08:00)
      return currentHour >= quietStart || currentHour < quietEnd
    }
  }

  private async sendNotifications(
    task: TaskReminder, 
    preferences: any
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    let emailSent = false
    let smsSent = false

    // Send email reminder
    if (preferences.email_enabled && preferences.email_address) {
      if (task.reminder_type === 'overdue') {
        emailSent = await emailService.sendOverdueAlert(preferences.email_address, task)
      } else {
        emailSent = await emailService.sendTaskReminder(preferences.email_address, task)
      }
    }

    // Send WhatsApp reminder
    if (preferences.whatsapp_enabled && preferences.whatsapp_number) {
      if (task.reminder_type === 'overdue') {
        smsSent = await smsService.sendOverdueAlertWhatsApp(preferences.whatsapp_number, task)
      } else {
        smsSent = await smsService.sendTaskReminderWhatsApp(preferences.whatsapp_number, task)
      }
    }

    return { emailSent, smsSent }
  }

  // Method to send immediate notification (e.g., when task is assigned)
  async sendImmediateNotification(userId: string, task: any): Promise<boolean> {
    try {
      // Get user preferences
      const { data: preferences } = await this.supabase
        .from('sme_notification_preferences')
        .select('*')
        .eq('sme_id', userId)
        .single()

      if (!preferences) return false

      const taskReminder: TaskReminder = {
        task_id: task.id,
        task_name: task.task_name,
        due_date: task.due_date,
        user_email: preferences.email_address,
        user_phone: preferences.whatsapp_number,
        days_until_due: Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        reminder_type: 'due_date',
      }

      const results = await this.sendNotifications(taskReminder, preferences)
      return results.emailSent || results.smsSent

    } catch (error) {
      console.error('Error sending immediate notification:', error)
      return false
    }
  }
}

export const reminderService = new ReminderService()