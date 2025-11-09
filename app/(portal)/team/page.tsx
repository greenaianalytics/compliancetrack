'use client'

import { useEffect, useState } from 'react'
import { useProtectedRoute } from '@/lib/protected-route'
import { getCurrentUser } from '@/lib/auth'
import { 
  getTeamMembers, 
  inviteTeamMember, 
  updateTeamMemberRole, 
  removeTeamMember,
  resendInvitation 
} from '@/lib/team-api'
import { TeamMember, InviteTeamMemberData } from '@/types/team'
import TeamMemberCard from '@/components/team/team-member-card'
import InviteTeamModal from '@/components/team/invite-team-modal'

export default function TeamManagementPage() {
  useProtectedRoute()
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        const members = await getTeamMembers(currentUser.id)
        setTeamMembers(members)
        
        // Check if current user is admin (you'll need to implement this properly)
        const currentUserMember = members.find(m => m.is_current_user)
        setCurrentUserIsAdmin(currentUserMember?.role === 'org_admin')
      }
    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (inviteData: InviteTeamMemberData) => {
    if (!user) return
    
    await inviteTeamMember(user.id, inviteData)
    await loadTeamData() // Reload to show new member
  }

  const handleRoleChange = async (userId: string, newRole: 'org_admin' | 'user') => {
    if (!user) return
    
    try {
      await updateTeamMemberRole(user.id, { user_id: userId, role: newRole })
      await loadTeamData() // Reload to reflect changes
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role. Please try again.')
    }
  }

  const handleRemove = async (userId: string) => {
    if (!user || !confirm('Are you sure you want to remove this team member?')) return
    
    try {
      await removeTeamMember(user.id, userId)
      await loadTeamData() // Reload to reflect changes
    } catch (error) {
      console.error('Error removing team member:', error)
      alert('Failed to remove team member. Please try again.')
    }
  }

  const handleResendInvitation = async (email: string) => {
    if (!user) return
    
    try {
      await resendInvitation(user.id, email)
      alert('Invitation resent successfully!')
    } catch (error) {
      console.error('Error resending invitation:', error)
      alert('Failed to resend invitation. Please try again.')
    }
  }

  const activeMembers = teamMembers.filter(m => m.invitation_status === 'accepted')
  const pendingMembers = teamMembers.filter(m => m.invitation_status !== 'accepted')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading team...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Team Management — by GreenAI Analytics
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm border rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your organization's team members and their permissions.
                  </p>
                </div>
                
                {currentUserIsAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    + Invite Team Member
                  </button>
                )}
              </div>
            </div>

            {/* Team Stats */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{activeMembers.length}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{pendingMembers.length}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="p-6">
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                  <p className="text-gray-600 mb-6">
                    {currentUserIsAdmin 
                      ? 'Invite your first team member to get started with collaborative compliance management.'
                      : 'Your organization admin can invite team members to help manage compliance tasks.'
                    }
                  </p>
                  {currentUserIsAdmin && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Invite Your First Team Member
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Members */}
                  {activeMembers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Members ({activeMembers.length})</h3>
                      <div className="space-y-4">
                        {activeMembers.map(member => (
                          <TeamMemberCard
                            key={member.id}
                            member={member}
                            currentUserIsAdmin={currentUserIsAdmin}
                            onRoleChange={handleRoleChange}
                            onRemove={handleRemove}
                            onResendInvitation={handleResendInvitation}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Invitations */}
                  {pendingMembers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations ({pendingMembers.length})</h3>
                      <div className="space-y-4">
                        {pendingMembers.map(member => (
                          <TeamMemberCard
                            key={member.id}
                            member={member}
                            currentUserIsAdmin={currentUserIsAdmin}
                            onRoleChange={handleRoleChange}
                            onRemove={handleRemove}
                            onResendInvitation={handleResendInvitation}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Notice */}
            {!currentUserIsAdmin && (
              <div className="px-6 py-4 bg-blue-50 border-t">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    Only organization administrators can invite new team members or change roles.
                    Contact your admin if you need additional permissions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteTeamModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
    </div>
  )
}