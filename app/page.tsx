import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-8">
      <div className="max-w-xl border rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-4">Compliance Track</h1>
        <p className="mb-6">Simple compliance task tracking for SMEs. Click below to start.</p>
        <div className="space-x-3">
          <Link href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            User Dashboard
          </Link>
          <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  )
}