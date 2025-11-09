import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured = false

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const config: SMTPConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    }

    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransport(config)
      this.isConfigured = true
      
      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          console.error('SMTP connection failed:', error)
          this.isConfigured = false
        } else {
          console.log('SMTP server is ready to send messages')
        }
      })
    } else {
      console.warn('SMTP credentials not configured. Email notifications will be logged to console.')
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const from = options.from || process.env.SMTP_FROM || 'Compliance Track <noreply@compliance-track.com>'
    
    const emailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    try {
      if (this.isConfigured && this.transporter) {
        await this.transporter.sendMail(emailOptions)
        console.log(`Email sent to: ${options.to}`)
        return true
      } else {
        // Log to console in development
        console.log('📧 Email (console):', {
          to: options.to,
          subject: options.subject,
          html: options.html,
        })
        return true // Return true even in dev mode
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Template-based email sending
  async sendTaskReminder(to: string, task: TaskReminder): Promise<boolean> {
    const subject = `Reminder: ${task.task_name} due in ${task.days_until_due} day${task.days_until_due !== 1 ? 's' : ''}`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
    .task-card { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 15px 0; }
    .due-date { color: #dc2626; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Compliance Track Reminder</h1>
    </div>
    <div class="content">
      <h2>Task Due Soon</h2>
      <p>This is a reminder about an upcoming compliance task:</p>
      
      <div class="task-card">
        <h3>${task.task_name}</h3>
        <p><strong>Due Date:</strong> <span class="due-date">${new Date(task.due_date).toLocaleDateString('en-IE')}</span></p>
        <p><strong>Status:</strong> Due in ${task.days_until_due} day${task.days_until_due !== 1 ? 's' : ''}</p>
      </div>

      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">View Task in Dashboard</a>
      
      <p>Please complete this task before the due date to maintain compliance.</p>
    </div>
    <div class="footer">
      <p>This is an automated reminder from Compliance Track — by GreenAI Analytics</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to,
      subject,
      html,
    })
  }

  async sendOverdueAlert(to: string, task: TaskReminder): Promise<boolean> {
    const subject = `URGENT: ${task.task_name} is OVERDUE`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fef2f2; padding: 20px; border-radius: 0 0 8px 8px; }
    .task-card { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 15px 0; }
    .due-date { color: #dc2626; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Compliance Alert</h1>
    </div>
    <div class="content">
      <h2>Task Overdue - Immediate Attention Required</h2>
      <p>The following compliance task is now overdue and requires immediate attention:</p>
      
      <div class="task-card">
        <h3>${task.task_name}</h3>
        <p><strong>Due Date:</strong> <span class="due-date">${new Date(task.due_date).toLocaleDateString('en-IE')} (OVERDUE)</span></p>
        <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">OVERDUE</span></p>
      </div>

      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Complete Task Now</a>
      
      <p style="color: #dc2626; font-weight: bold;">
        Please complete this task immediately to avoid compliance issues.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated alert from Compliance Track — by GreenAI Analytics</p>
      <p>If you have any questions, please contact our support team immediately.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to,
      subject,
      html,
    })
  }
}

export const emailService = new EmailService()