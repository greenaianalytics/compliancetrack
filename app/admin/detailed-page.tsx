'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalTenants: number
  activeSubscriptions: number
  sponsoredAccounts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTenants: 0,
    activeSubscriptions: 0,
    sponsoredAccounts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createBrowserClient()
    
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get total tenants
      const { count: totalTenants } = await supabase
        .from('sme_profiles')
        .select('*', { count: 'exact', head: true })

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')

      // Get sponsored accounts
      const { count: sponsoredAccounts } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_sponsored', true)

      setStats({
        totalUsers: totalUsers || 0,
        totalTenants: totalTenants || 0,
        activeSubscriptions: activeSubscriptions || 0,
        sponsoredAccounts: sponsoredAccounts || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTenants}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Sponsored Accounts</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.sponsoredAccounts}</p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management */}
            <Link href="/admin/users" className="block">
              <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage users, set sponsorship, view subscriptions
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Platform Settings */}
            <Link href="/admin/settings" className="block">
              <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">⚙️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Platform Settings</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure pricing, email, WhatsApp, and system settings
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* System Health */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">💚</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                  <p className="text-sm text-green-600 mt-1">All systems operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}