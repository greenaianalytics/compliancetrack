import { createBrowserClient } from './supabase'
import { sendEmail } from './email'
import { OnboardingData } from '@/types/onboarding'

export const createSMEProfile = async (userId: string, data: OnboardingData) => {
  const supabase = createBrowserClient()
  
  // Create SME profile
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .insert([
      {
        user_id: userId,
        business_name: data.business_name,
        business_address: `${data.business_address}, ${data.city}, ${data.county}, ${data.eircode}`,
        country_code: data.country_code,
        phone_number: data.phone_number,
        nace_codes: [data.nace_code],
        company_size: data.company_size,
        dashboard_start_date: data.registration_date,
      }
    ])
    .select()
    .single()

  if (profileError) {
    throw new Error(`Failed to create SME profile: ${profileError.message}`)
  }

  // Send team member invitations
  if (data.team_members && data.team_members.length > 0) {
    await sendTeamMemberInvitations(data.business_name, data.team_members)
  }

  return smeProfile
}

export const completeOnboarding = async (userId: string) => {
  const supabase = createBrowserClient()
  
  // Mark the user as having completed onboarding
  const { error } = await supabase
    .from('users')
    .update({ 
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error marking onboarding complete:', error)
  }
}

/**
 * Send invitation emails to team members
 */
export const sendTeamMemberInvitations = async (businessName: string, teamMembers: any[]) => {
  for (const member of teamMembers) {
    try {
      const invitationLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000'}/signup?invited_by=${member.email}`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're Invited to Compliance Track!</h2>
          <p>Hi ${member.name},</p>
          <p><strong>${businessName}</strong> has invited you to join their team on Compliance Track.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Your Role:</strong> ${member.role === 'org_admin' ? 'Organization Admin' : 'Team Member'}
            </p>
            <p style="margin: 8px 0 0 0; color: #1e40af;">
              As a ${member.role === 'org_admin' ? 'admin' : 'team member'}, you'll be able to ${member.role === 'org_admin' ? 'manage compliance tasks and team members' : 'track and manage compliance tasks'}.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Or copy and paste this link in your browser:<br/>
            ${invitationLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Compliance Track - Simplifying EU Compliance for SMEs<br/>
            Made by GreenAI Analytics
          </p>
        </div>
      `

      const result = await sendEmail(
        member.email,
        `You're invited to join ${businessName} on Compliance Track`,
        html
      )

      if (!result.success) {
        console.error(`Failed to send invitation to ${member.email}:`, result.error)
      }
    } catch (error) {
      console.error(`Error sending invitation to ${member.email}:`, error)
    }
  }
}