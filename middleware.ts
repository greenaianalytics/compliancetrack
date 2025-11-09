import { NextResponse } from 'next/server'

export function middleware(request: any) {
  // Temporarily disable middleware to test admin login
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all paths for now
  ],
}