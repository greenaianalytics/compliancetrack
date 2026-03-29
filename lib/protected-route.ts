'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from './auth'
import { debugLog } from './debug'

export const useProtectedRoute = () => {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      debugLog('ProtectedRoute', 'Checking auth')
      const user = await getCurrentUser()
      debugLog('ProtectedRoute', `User: ${user ? user.email : 'none'}`)
      
      if (!user) {
        debugLog('ProtectedRoute', 'No user, redirecting')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])
}