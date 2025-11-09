'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession()
        console.log('Auth layout session check:', session)
        
        if (session) {
          console.log('Auth layout: User authenticated, redirecting to dashboard')
          // Use replace to avoid adding to history
          router.replace('/dashboard')
          return
        }
      } catch (error) {
        console.error('Auth layout error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}