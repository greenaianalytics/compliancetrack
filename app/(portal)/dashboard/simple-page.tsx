'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      console.log('Dashboard user:', user)
      
      if (!user) {
        console.log('No user found, redirecting to login')
        router.replace('/login')
        return
      }
      
      setUser(user)
      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.replace('/login')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Use hard redirect to ensure clean state
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading dashboard...</div>
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
              Compliance Track — by GreenAI Analytics
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
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
              Welcome to Compliance Track
            </h2>
            <p className="text-gray-600">
              You are successfully logged in as {user?.email}
            </p>
            <div className="mt-4">
              <p className="text-sm text-green-600">
                ✅ Authentication is working! You can see the dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}