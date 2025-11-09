export interface TeamMember {
  id: string
  user_id: string
  email: string
  full_name: string
  role: 'org_admin' | 'user'
  avatar_url?: string
  last_active?: string
  invited_at: string
  invitation_status: 'sent' | 'accepted' | 'expired'
  is_current_user?: boolean
}

export interface InviteTeamMemberData {
  email: string
  role: 'org_admin' | 'user'
  name: string
}

export interface UpdateTeamMemberRoleData {
  user_id: string
  role: 'org_admin' | 'user'
}