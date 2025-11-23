import { createBrowserClient } from './supabase'

/**
 * Send email using Resend
 */
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const supabase = createBrowserClient()
  
  // Get email settings from platform configuration
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('*')
    .single()

  if (!settings?.resend_api_key) {
    console.error('Resend API key not configured')
    return { success: false, error: 'Email service not configured' }
  }

  // Use configured from address or fallback to GreenAI Analytics domain
  const fromAddress = settings.email_from_address || 'noreply@notification.greenaianalytics.org'
  const fromName = settings.email_from_name || 'Compliance Track'

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.resend_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [to],
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    const data = await response.json()
    console.log('Email sent successfully:', data.id)
    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Resend error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Email templates for Compliance Track
 */
export const emailTemplates = {
  /**
   * Task reminder email template
   */
  taskReminder: (taskName: string, dueDate: string, userName: string) => ({
    subject: `Compliance Track: ${taskName} due on ${dueDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Compliance Track</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
        </div>
        <p>Hello ${userName},</p>
        <p>This is a reminder that your compliance task <strong>${taskName}</strong> is due on <strong>${dueDate}</strong>.</p>
        <p>Please log in to your dashboard to complete this task.</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
          <p style="margin: 0;"><strong>Task:</strong> ${taskName}</p>
          <p style="margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This email was sent from Compliance Track by GreenAI Analytics.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  }),

  /**
   * Welcome email for new users
   */
  welcome: (userName: string) => ({
    subject: 'Welcome to Compliance Track - GreenAI Analytics',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Compliance Track</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
        </div>
        <p>Hello ${userName},</p>
        <p>Welcome to <strong>Compliance Track</strong> - your solution for simplified EU compliance management.</p>
        <p>Your account has been successfully created and is ready to use. You can now access your compliance dashboard and start managing your tasks.</p>
        <p style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </p>
        <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 5px;">
          <h4 style="color: #0369a1; margin: 0 0 10px 0;">What you can do:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Track compliance tasks and deadlines</li>
            <li>Receive automated reminders</li>
            <li>Access country-specific compliance knowledge</li>
            <li>Generate compliance reports</li>
          </ul>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This email was sent from Compliance Track by GreenAI Analytics.<br>
            Address: notification.greenaianalytics.org
          </p>
        </div>
      </div>
    `
  }),

  /**
   * Password reset email
   */
  passwordReset: (userName: string, resetLink: string) => ({
    subject: 'Compliance Track - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Compliance Track</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
        </div>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password for your Compliance Track account.</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Your Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this reset, please ignore this email. The link will expire in 1 hour.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This email was sent from Compliance Track by GreenAI Analytics.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  }),

  /**
   * Email verification email
   */
  emailVerification: (userName: string, verificationLink: string) => ({
    subject: 'Verify Your Email - Compliance Track',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Compliance Track</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
        </div>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up for Compliance Track! Please verify your email address to activate your account.</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${verificationLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't create an account, please ignore this email.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This email was sent from Compliance Track by GreenAI Analytics.
          </p>
        </div>
      </div>
    `
  }),

  /**
   * Urgent task notification
   */
  urgentTask: (taskName: string, dueDate: string, userName: string) => ({
    subject: `URGENT: ${taskName} due today!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0;">Compliance Track</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
        </div>
        <p>Hello ${userName},</p>
        <p style="color: #dc2626; font-weight: bold;">URGENT: Your compliance task <strong>${taskName}</strong> is due today (<strong>${dueDate}</strong>)!</p>
        <p>This task requires immediate attention to maintain compliance.</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 5px;">
          <p style="margin: 0; color: #dc2626;"><strong>Task:</strong> ${taskName}</p>
          <p style="margin: 0; color: #dc2626;"><strong>Due Date:</strong> ${dueDate} (TODAY)</p>
          <p style="margin: 10px 0 0 0; color: #dc2626;"><strong>Status:</strong> ⚠️ URGENT</p>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Complete Task Now
          </a>
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an urgent notification from Compliance Track by GreenAI Analytics.
          </p>
        </div>
      </div>
    `
  }),

  /**
   * Weekly summary email
   */
  weeklySummary: (userName: string, completedTasks: number, pendingTasks: number, upcomingTasks: Array<{name: string, dueDate: string}>) => ({
    subject: `Your Weekly Compliance Summary`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Compliance Track</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0;">by GreenAI Analytics</p>
        </div>
        <p>Hello ${userName},</p>
        <p>Here's your weekly compliance summary:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; text-align: center;">
            <h3 style="margin: 0 0 5px 0; color: #0369a1;">${completedTasks}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Tasks Completed</p>
          </div>
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; text-align: center;">
            <h3 style="margin: 0 0 5px 0; color: #d97706;">${pendingTasks}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Tasks Pending</p>
          </div>
        </div>

        ${upcomingTasks.length > 0 ? `
          <div style="margin-top: 20px;">
            <h4 style="color: #374151; margin-bottom: 10px;">Upcoming Tasks This Week:</h4>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px;">
              ${upcomingTasks.map(task => `
                <div style="display: flex; justify-content: between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="flex: 1;">${task.name}</span>
                  <span style="color: #6b7280;">${task.dueDate}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <p style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Full Dashboard
          </a>
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This weekly summary was sent from Compliance Track by GreenAI Analytics.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * Utility function to send task reminder emails
 */
export async function sendTaskReminder(email: string, taskName: string, dueDate: string, userName: string) {
  const template = emailTemplates.taskReminder(taskName, dueDate, userName)
  return await sendEmail(email, template.subject, template.html)
}

/**
 * Utility function to send welcome email
 */
export async function sendWelcomeEmail(email: string, userName: string) {
  const template = emailTemplates.welcome(userName)
  return await sendEmail(email, template.subject, template.html)
}

/**
 * Utility function to send password reset email
 */
export async function sendPasswordResetEmail(email: string, userName: string, resetLink: string) {
  const template = emailTemplates.passwordReset(userName, resetLink)
  return await sendEmail(email, template.subject, template.html)
}

/**
 * Utility function to send email verification
 */
export async function sendEmailVerification(email: string, userName: string, verificationLink: string) {
  const template = emailTemplates.emailVerification(userName, verificationLink)
  return await sendEmail(email, template.subject, template.html)
}

/**
 * Utility function to send urgent task notification
 */
export async function sendUrgentTaskEmail(email: string, taskName: string, dueDate: string, userName: string) {
  const template = emailTemplates.urgentTask(taskName, dueDate, userName)
  return await sendEmail(email, template.subject, template.html)
}

/**
 * Utility function to send weekly summary
 */
export async function sendWeeklySummary(email: string, userName: string, completedTasks: number, pendingTasks: number, upcomingTasks: Array<{name: string, dueDate: string}>) {
  const template = emailTemplates.weeklySummary(userName, completedTasks, pendingTasks, upcomingTasks)
  return await sendEmail(email, template.subject, template.html)
}
