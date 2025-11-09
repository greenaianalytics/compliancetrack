'use client'

import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { useEffect, useState } from 'react'

interface HeaderProps {
  userEmail?: string
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Your App Logo" 
              className="h-8 w-8" // Adjust size as needed
            />
            <h1 className="text-xl font-bold text-gray-900">
              Your App Name
            </h1>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {userEmail && (
              <span className="text-sm text-gray-600">
                Welcome, {userEmail}
              </span>
            )}
            <button
              onClick={() => router.push('/settings')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Settings
            </button>
            <button
              onClick={async () => {
                await signOut()
                window.location.href = '/login'
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}