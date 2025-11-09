// Add this to your existing header component or create one
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              Compliance Track — by GreenAI Analytics
            </h1>
            <nav className="flex space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/knowledge"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/knowledge'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Knowledge Hub
              </Link>
              <Link
                href="/team"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/team'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Team
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.email}
            </span>
            <button
              onClick={() => {
                // Add sign out functionality
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