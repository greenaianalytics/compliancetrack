import { createServerClient } from './supabase'
import { sendSMS, smsTemplates } from './sms'
import { sendEmail, emailTemplates } from './email'

/**
 * Send reminder notifications for upcoming tasks
 */
export async function sendTaskReminders() {
  const supabase = createServerClient()
  
  try {
    // Get tasks due in the next 7 days
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const { data: upcomingTasks, error } = await supabase
      .from('sme_compliance_status')
      .select(`
        id,
        due_date,
        status,
        compliance_tasks (
          task_name,
          priority
        ),
        sme_profiles (
          id,
          business_name,
          sme_notification_preferences (
            email_enabled,
            whatsapp_enabled,
            email_address,
            whatsapp_number,
            reminder_lead_days
          )
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', nextWeek.toISOString())
      .gte('due_date', new Date().toISOString())

    if (error) {
      console.error('Error fetching upcoming tasks:', error)
      return
    }

    if (!upcomingTasks || upcomingTasks.length === 0) {
      console.log('No upcoming tasks found for reminders')
      return
    }

    console.log(`Found ${upcomingTasks.length} tasks for reminder processing`)

    // Process each task and send reminders
    for (const task of upcomingTasks) {
      await processTaskReminder(task)
    }

  } catch (error) {
    console.error('Error in sendTaskReminders:', error)
  }
}

/**
 * Process reminders for a single task
 */
async function processTaskReminder(task: any) {
  if (!task.sme_profiles?.sme_notification_preferences) {
    return
  }

  const preferences = task.sme_profiles.sme_notification_preferences
  const dueDate = new Date(task.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  // Check if we should send reminder based on lead days
  const reminderDays = preferences.reminder_lead_days || [7, 3, 1]
  
  if (reminderDays.includes(daysUntilDue)) {
    const taskName = task.compliance_tasks?.task_name || 'Unknown Task'
    
    // Send email reminder
    if (preferences.email_enabled && preferences.email_address) {
      await sendEmailReminder(
        preferences.email_address,
        taskName,
        dueDate.toLocaleDateString(),
        task.sme_profiles.business_name
      )
    }
    
    // Send SMS reminder
    if (preferences.whatsapp_enabled && preferences.whatsapp_number) {
      await sendSMSReminder(
        preferences.whatsapp_number,
        taskName,
        dueDate.toLocaleDateString()
      )
    }
  }
}

/**
 * Send email reminder
 */
async function sendEmailReminder(email: string, taskName: string, dueDate: string, businessName: string) {
  try {
    const template = emailTemplates.taskReminder(taskName, dueDate, businessName)
    const result = await sendEmail(email, template.subject, template.html)
    
    if (result.success) {
      console.log(`Email reminder sent to ${email} for task: ${taskName}`)
    } else {
      console.error(`Failed to send email to ${email}:`, result.error)
    }
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error)
  }
}

/**
 * Send SMS reminder
 */
async function sendSMSReminder(phoneNumber: string, taskName: string, dueDate: string) {
  try {
    const message = smsTemplates.taskReminder(taskName, dueDate)
    const result = await sendSMS(phoneNumber, message)
    
    if (result.success) {
      console.log(`SMS reminder sent to ${phoneNumber} for task: ${taskName}`)
    } else {
      console.error(`Failed to send SMS to ${phoneNumber}:`, result.error)
    }
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error)
  }
}

/**
 * Send urgent task notifications (due today)
 */
export async function sendUrgentTaskNotifications() {
  const supabase = createServerClient()
  
  try {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of day
    
    const { data: urgentTasks, error } = await supabase
      .from('sme_compliance_status')
      .select(`
        id,
        due_date,
        compliance_tasks (
          task_name,
          priority
        ),
        sme_profiles (
          id,
          business_name,
          sme_notification_preferences (
            email_enabled,
            whatsapp_enabled,
            email_address,
            whatsapp_number
          )
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', today.toISOString())
      .gte('due_date', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')

    if (error) {
      console.error('Error fetching urgent tasks:', error)
      return
    }

    if (!urgentTasks || urgentTasks.length === 0) {
      console.log('No urgent tasks found for today')
      return
    }

    console.log(`Found ${urgentTasks.length} urgent tasks for today`)

    for (const task of urgentTasks) {
      await processUrgentTaskNotification(task)
    }

  } catch (error) {
    console.error('Error in sendUrgentTaskNotifications:', error)
  }
}

/**
 * Process urgent task notification
 */
async function processUrgentTaskNotification(task: any) {
  if (!task.sme_profiles?.sme_notification_preferences) {
    return
  }

  const preferences = task.sme_profiles.sme_notification_preferences
  const taskName = task.compliance_tasks?.task_name || 'Unknown Task'
  const dueDate = new Date(task.due_date).toLocaleDateString()
  
  // Send urgent email
  if (preferences.email_enabled && preferences.email_address) {
    await sendUrgentEmail(
      preferences.email_address,
      taskName,
      dueDate,
      task.sme_profiles.business_name
    )
  }
  
  // Send urgent SMS
  if (preferences.whatsapp_enabled && preferences.whatsapp_number) {
    await sendUrgentSMS(
      preferences.whatsapp_number,
      taskName,
      dueDate
    )
  }
}

/**
 * Send urgent email notification
 */
async function sendUrgentEmail(email: string, taskName: string, dueDate: string, businessName: string) {
  try {
    const template = emailTemplates.urgentTask(taskName, dueDate, businessName)
    const result = await sendEmail(email, template.subject, template.html)
    
    if (result.success) {
      console.log(`Urgent email sent to ${email} for task: ${taskName}`)
    } else {
      console.error(`Failed to send urgent email to ${email}:`, result.error)
    }
  } catch (error) {
    console.error(`Error sending urgent email to ${email}:`, error)
  }
}

/**
 * Send urgent SMS notification
 */
async function sendUrgentSMS(phoneNumber: string, taskName: string, dueDate: string) {
  try {
    const message = smsTemplates.urgentTask(taskName)
    const result = await sendSMS(phoneNumber, message)
    
    if (result.success) {
      console.log(`Urgent SMS sent to ${phoneNumber} for task: ${taskName}`)
    } else {
      console.error(`Failed to send urgent SMS to ${phoneNumber}:`, result.error)
    }
  } catch (error) {
    console.error(`Error sending urgent SMS to ${phoneNumber}:`, error)
  }
}
