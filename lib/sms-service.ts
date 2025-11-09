export interface SMSOptions {
  to: string
  body: string
  from?: string
}

export interface WhatsAppOptions {
  to: string
  body: string
}

class SMSService {
  private isConfigured = false

  constructor() {
    // Check if Twilio or other SMS provider is configured
    this.isConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      if (this.isConfigured && process.env.TWILIO_ACCOUNT_SID) {
        // Twilio implementation
        const twilio = require('twilio')
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        
        await client.messages.create({
          body: options.body,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: options.to,
        })
        
        console.log(`SMS sent to: ${options.to}`)
        return true
      } else {
        // Log to console in development
        console.log('📱 SMS (console):', {
          to: options.to,
          body: options.body,
        })
        return true
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return false
    }
  }

  async sendWhatsApp(options: WhatsAppOptions): Promise<boolean> {
    try {
      if (this.isConfigured && process.env.TWILIO_ACCOUNT_SID) {
        // Twilio WhatsApp implementation
        const twilio = require('twilio')
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        
        await client.messages.create({
          body: options.body,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${options.to}`,
        })
        
        console.log(`WhatsApp message sent to: ${options.to}`)
        return true
      } else {
        // Log to console in development
        console.log('💬 WhatsApp (console):', {
          to: options.to,
          body: options.body,
        })
        return true
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      return false
    }
  }

  // Template-based message sending
  async sendTaskReminderSMS(to: string, task: TaskReminder): Promise<boolean> {
    const body = `Compliance Track Reminder: "${task.task_name}" due in ${task.days_until_due} day${task.days_until_due !== 1 ? 's' : ''} (${new Date(task.due_date).toLocaleDateString('en-IE')}). Login to view: ${process.env.NEXTAUTH_URL}/dashboard`
    
    return this.sendSMS({ to, body })
  }

  async sendTaskReminderWhatsApp(to: string, task: TaskReminder): Promise<boolean> {
    const body = `🔔 *Compliance Track Reminder*

*Task:* ${task.task_name}
*Due Date:* ${new Date(task.due_date).toLocaleDateString('en-IE')}
*Status:* Due in ${task.days_until_due} day${task.days_until_due !== 1 ? 's' : ''}

Please complete this task before the due date to maintain compliance.

View task: ${process.env.NEXTAUTH_URL}/dashboard

— Compliance Track by GreenAI Analytics`
    
    return this.sendWhatsApp({ to, body })
  }

  async sendOverdueAlertSMS(to: string, task: TaskReminder): Promise<boolean> {
    const body = `🚨 URGENT: "${task.task_name}" is OVERDUE (was due ${new Date(task.due_date).toLocaleDateString('en-IE')}). Immediate action required! Login: ${process.env.NEXTAUTH_URL}/dashboard`
    
    return this.sendSMS({ to, body })
  }

  async sendOverdueAlertWhatsApp(to: string, task: TaskReminder): Promise<boolean> {
    const body = `🚨 *URGENT COMPLIANCE ALERT*

*Task:* ${task.task_name}
*Due Date:* ${new Date(task.due_date).toLocaleDateString('en-IE')} *OVERDUE*
*Status:* *IMMEDIATE ACTION REQUIRED*

This task is now overdue. Please complete it immediately to avoid compliance issues.

Complete now: ${process.env.NEXTAUTH_URL}/dashboard

— Compliance Track by GreenAI Analytics`
    
    return this.sendWhatsApp({ to, body })
  }
}

export const smsService = new SMSService()