'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from './auth'

export const useProtectedRoute = () => {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Protected route checking auth...')
      const user = await getCurrentUser()
      console.log('Protected route user:', user)
      
      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])
}