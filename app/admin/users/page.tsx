'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface User {
  id: string
  email: string
  subscription_status: string
  is_sponsored: boolean
  created_at: string
  sme_profiles: {
    business_name: string
  } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        subscription_status,
        is_sponsored,
        created_at,
        sme_profiles (
          business_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading users:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const toggleSponsorship = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('users')
      .update({ is_sponsored: !currentStatus })
      .eq('id', userId)

    if (error) {
      console.error('Error updating sponsorship:', error)
      alert('Error updating sponsorship status')
    } else {
      await loadUsers() // Reload to reflect changes
    }
    
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <button
              onClick={() => window.history.back()}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsored
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.sme_profiles?.business_name || 'No business profile'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                        user.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_sponsored ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_sponsored ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleSponsorship(user.id, user.is_sponsored)}
                        disabled={updating === user.id}
                        className={`mr-3 ${
                          user.is_sponsored 
                            ? 'text-orange-600 hover:text-orange-900' 
                            : 'text-green-600 hover:text-green-900'
                        } disabled:opacity-50`}
                      >
                        {updating === user.id ? 'Updating...' : 
                         user.is_sponsored ? 'Remove Sponsorship' : 'Make Sponsored'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}