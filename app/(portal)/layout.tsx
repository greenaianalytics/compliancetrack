'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function PortalLayout({
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
        console.log('Portal layout session check:', session)
        
        if (!session) {
          console.log('Portal layout: No session, redirecting to login')
          router.replace('/login')
          return
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Portal layout error:', error)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}