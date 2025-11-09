import { createBrowserClient } from './supabase'
import { TeamMember, InviteTeamMemberData, UpdateTeamMemberRoleData } from '@/types/team'

export const getTeamMembers = async (userId: string): Promise<TeamMember[]> => {
  const supabase = createBrowserClient()
  
  // Get SME profile to find organization
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (profileError || !smeProfile) {
    console.error('Error loading SME profile:', profileError)
    return []
  }

  // Get all users in this organization
  const { data: tenantUsers, error: usersError } = await supabase
    .from('sme_profiles')
    .select(`
      user_id,
      users (
        id,
        email,
        full_name,
        avatar_url,
        last_sign_in_at,
        invited_by,
        invitation_sent_at,
        invitation_status
      )
    `)
    .eq('id', smeProfile.id)

  if (usersError) {
    console.error('Error loading team members:', usersError)
    return []
  }

  // Transform the data
  const teamMembers: TeamMember[] = tenantUsers
    .filter(tu => tu.users) // Filter out null users
    .map(tu => ({
      id: tu.users.id,
      user_id: tu.users.id,
      email: tu.users.email,
      full_name: tu.users.full_name || '',
      role: 'user', // You'll need to implement role management
      avatar_url: tu.users.avatar_url,
      last_active: tu.users.last_sign_in_at,
      invited_at: tu.users.invitation_sent_at,
      invitation_status: tu.users.invitation_status || 'sent',
      is_current_user: tu.users.id === userId,
    }))

  return teamMembers
}

export const inviteTeamMember = async (userId: string, inviteData: InviteTeamMemberData) => {
  const supabase = createBrowserClient()
  
  // Get SME profile
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('id, business_name')
    .eq('user_id', userId)
    .single()

  if (profileError || !smeProfile) {
    throw new Error('SME profile not found')
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', inviteData.email)
    .single()

  if (existingUser) {
    // User exists, add them to the organization
    const { error: addError } = await supabase
      .from('sme_profiles')
      .insert([
        {
          user_id: existingUser.id,
          business_name: smeProfile.business_name,
          business_address: '', // You might want to copy from existing profile
          country_code: 'IE', // Default
        }
      ])

    if (addError) {
      throw new Error(`Failed to add user to organization: ${addError.message}`)
    }
  } else {
    // Create new user invitation
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(inviteData.email, {
      data: {
        invited_by: userId,
        business_name: smeProfile.business_name,
        role: inviteData.role,
      }
    })

    if (inviteError) {
      throw new Error(`Failed to send invitation: ${inviteError.message}`)
    }
  }

  return { success: true }
}

export const updateTeamMemberRole = async (adminUserId: string, updateData: UpdateTeamMemberRoleData) => {
  const supabase = createBrowserClient()
  
  // In a real implementation, you'd update the user's role in your user_roles table
  // For now, we'll just return success
  console.log('Updating user role:', updateData)
  
  return { success: true }
}

export const removeTeamMember = async (adminUserId: string, teamMemberId: string) => {
  const supabase = createBrowserClient()
  
  // Get SME profile
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('id')
    .eq('user_id', adminUserId)
    .single()

  if (profileError || !smeProfile) {
    throw new Error('SME profile not found')
  }

  // Remove user from organization
  const { error } = await supabase
    .from('sme_profiles')
    .delete()
    .eq('user_id', teamMemberId)
    .eq('id', smeProfile.id)

  if (error) {
    throw new Error(`Failed to remove team member: ${error.message}`)
  }

  return { success: true }
}

export const resendInvitation = async (adminUserId: string, email: string) => {
  const supabase = createBrowserClient()
  
  // Resend invitation email
  const { error } = await supabase.auth.admin.inviteUserByEmail(email)

  if (error) {
    throw new Error(`Failed to resend invitation: ${error.message}`)
  }

  return { success: true }
}