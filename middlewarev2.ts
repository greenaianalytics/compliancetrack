import { NextResponse } from 'next/server'

export function middleware(request: any) {
  // Temporarily disabled to avoid conflicts
  return NextResponse.next()
}

export const config = {
  matcher: [],
}