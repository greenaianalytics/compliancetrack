export interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  subject: string
  body: string
  variables: string[]
  is_active: boolean
}

export interface ScheduledNotification {
  id: string
  user_id: string
  type: 'email' | 'sms' | 'whatsapp'
  subject: string
  body: string
  scheduled_for: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  retry_count: number
  last_attempt?: string
  error_message?: string
}

export interface NotificationPreference {
  user_id: string
  email_enabled: boolean
  sms_enabled: boolean
  whatsapp_enabled: boolean
  email_address: string
  phone_number: string
  quiet_hours_start: string
  quiet_hours_end: string
  reminder_lead_days: number[]
}

export interface TaskReminder {
  task_id: string
  task_name: string
  due_date: string
  user_email: string
  user_phone?: string
  days_until_due: number
  reminder_type: 'due_date' | 'overdue'
}