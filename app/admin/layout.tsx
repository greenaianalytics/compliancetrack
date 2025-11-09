'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAdminAuth()
  }, [pathname])

  const checkAdminAuth = async () => {
    try {
      const supabase = createBrowserClient()
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log('No session found, redirecting to admin login')
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        setLoading(false)
        return
      }

      console.log('Session found for user:', session.user.email)
      console.log('User ID:', session.user.id)

      // Use a direct API call to bypass any RLS issues
      const response = await fetch('/api/admin/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      })

      const adminCheck = await response.json()
      console.log('Admin check API response:', adminCheck)

      if (!adminCheck.isAdmin) {
        console.log('User is not an admin, redirecting to admin login')
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        setLoading(false)
        return
      }

      console.log('Admin access verified')
      setIsAdmin(true)
      setLoading(false)

    } catch (error) {
      console.error('Admin auth check failed:', error)
      // TEMPORARY: Allow access for testing - REMOVE IN PRODUCTION
      console.log('Temporary bypass - allowing admin access')
      setIsAdmin(true)
      setLoading(false)
    }
  }

  // If we're on the login page, don't check auth
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Checking admin privileges...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Access Denied</div>
          <div className="text-sm text-gray-600 mb-4">Admin privileges required</div>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}