'use client'

import { TeamMember } from '@/types/team'

interface TeamMemberCardProps {
  member: TeamMember
  currentUserIsAdmin: boolean
  onRoleChange: (userId: string, newRole: 'org_admin' | 'user') => void
  onRemove: (userId: string) => void
  onResendInvitation: (email: string) => void
}

export default function TeamMemberCard({ 
  member, 
  currentUserIsAdmin, 
  onRoleChange, 
  onRemove,
  onResendInvitation 
}: TeamMemberCardProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { color: 'bg-yellow-100 text-yellow-800', text: 'Invited' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Active' },
      expired: { color: 'bg-red-100 text-red-800', text: 'Expired' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.sent
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      org_admin: { color: 'bg-purple-100 text-purple-800', text: 'Admin' },
      user: { color: 'bg-blue-100 text-blue-800', text: 'User' },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never'
    
    const lastActiveDate = new Date(lastActive)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays < 7) return `${diffDays - 1} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {member.avatar_url ? (
              <img
                className="h-12 w-12 rounded-full"
                src={member.avatar_url}
                alt={member.full_name}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {member.full_name ? member.full_name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Member Info */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-medium text-gray-900">
                {member.full_name || 'No name provided'}
              </h3>
              {member.is_current_user && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{member.email}</p>
            <div className="flex items-center space-x-2">
              {getRoleBadge(member.role)}
              {getStatusBadge(member.invitation_status)}
            </div>
          </div>
        </div>

        {/* Actions */}
        {currentUserIsAdmin && !member.is_current_user && (
          <div className="flex items-center space-x-2">
            {/* Role Dropdown */}
            <select
              value={member.role}
              onChange={(e) => onRoleChange(member.user_id, e.target.value as 'org_admin' | 'user')}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="org_admin">Admin</option>
            </select>

            {/* Resend Invitation */}
            {member.invitation_status !== 'accepted' && (
              <button
                onClick={() => onResendInvitation(member.email)}
                className="text-sm text-blue-600 hover:text-blue-500 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                Resend
              </button>
            )}

            {/* Remove Member */}
            <button
              onClick={() => onRemove(member.user_id)}
              className="text-sm text-red-600 hover:text-red-500 px-3 py-1 border border-red-300 rounded-md hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          {member.invitation_status === 'accepted' ? (
            <span>Last active: {formatLastActive(member.last_active)}</span>
          ) : (
            <span>Invited: {new Date(member.invited_at).toLocaleDateString('en-IE')}</span>
          )}
        </div>
        
        {!currentUserIsAdmin && member.is_current_user && (
          <span className="text-xs text-gray-400">Contact an admin to change your role</span>
        )}
      </div>
    </div>
  )
}