import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Compliance Track',
  description: 'Simplify EU Compliance for SMEs',
   icons: {
    icon: '/favicon.ico', // This will use your new favicon
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {children}

            {/* Global Footer - Only shows if no other footer is present */}
            <footer className="bg-white border-t mt-auto py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-sm text-gray-500">
                      Made by
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      GreenAI Analytics
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Simplify EU Compliance for SMEs • {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}