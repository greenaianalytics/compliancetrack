'use client'

import { OnboardingData, TeamMember } from '@/types/onboarding'

interface TeamInvitesStepProps {
  data: OnboardingData
  onChange: (data: Partial<OnboardingData>) => void
}

export default function TeamInvitesStep({ data, onChange }: TeamInvitesStepProps) {
  const addTeamMember = () => {
    const newMembers = [...(data.team_members || []), { email: '', role: 'user', name: '' }]
    onChange({ team_members: newMembers })
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...(data.team_members || [])]
    newMembers[index] = { ...newMembers[index], [field]: value }
    onChange({ team_members: newMembers })
  }

  const removeTeamMember = (index: number) => {
    const newMembers = (data.team_members || []).filter((_, i) => i !== index)
    onChange({ team_members: newMembers })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Your Team</h2>
        <p className="text-gray-600">Add team members to help manage compliance tasks (optional).</p>
      </div>

      <div className="space-y-4">
        {(data.team_members || []).map((member, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@company.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, 'role', e.target.value as 'org_admin' | 'user')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="org_admin">Organization Admin</option>
                </select>
              </div>
            </div>
            
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => removeTeamMember(index)}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addTeamMember}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
        >
          + Add Team Member
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Team Roles</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Organization Admin:</strong> Full access to manage settings, users, and billing</li>
          <li><strong>User:</strong> Can view and complete compliance tasks</li>
        </ul>
      </div>
    </div>
  )
}