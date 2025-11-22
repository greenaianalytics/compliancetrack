'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('demo@carbontrackai.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createBrowserClient()
      
      console.log('Attempting admin login with:', email)
      
      // Sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('No user data returned')
        setLoading(false)
        return
      }

      console.log('Auth successful, checking admin privileges for user:', data.user.id)

      // Use service role key to bypass RLS for admin check
      const response = await fetch('/api/admin/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: data.user.id }),
      })

      const adminCheck = await response.json()

      console.log('Admin check result:', adminCheck)

      if (!adminCheck.isAdmin) {
        setError('Access denied. Admin privileges required.')
        // Sign out the non-admin user
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      console.log('Admin access granted, redirecting to admin dashboard...')
      // Success - redirect to admin dashboard
      router.push('/admin')
      router.refresh()

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 relative">
              <Image
                src="/logo.png"
                alt="Compliance Track Logo"
                width={64}
                height={64}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compliance Track
          </h1>
          <h2 className="text-xl text-gray-600">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-2">
            Platform Management Dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to User Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
