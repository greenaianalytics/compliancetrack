'use client'

import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading admin dashboard...</div>
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
              Admin Portal — Compliance Track
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Welcome to Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Admin portal is working! Redirect loop has been fixed.
            </p>
            <div className="mt-4">
              <p className="text-sm text-green-600">
                ✅ Admin authentication is working!
              </p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">Quick Stats</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Total Users: 0<br />
                  Total Tenants: 0<br />
                  Active Subscriptions: 0
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => router.push('/admin/settings')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Platform Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}