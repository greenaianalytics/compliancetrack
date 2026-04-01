import Link from 'next/link'

const configKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'ELKS_USERNAME',
  'ELKS_PASSWORD'
]

export default function AdminPage() {
  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
        </div>
        <p className="text-gray-600 mb-6">Environment values are stored in Vercel. This is a safe read-only placeholder.</p>

        <div className="grid grid-cols-1 gap-2">
          {configKeys.map(key => (
            <div key={key} className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-sm">{key}</div>
              <div className="text-xs text-gray-600">{process.env[key] ? 'set' : 'not set'}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">Use Vercel Dashboard → Settings → Environment Variables to set API keys and pricing settings.</p>
        </div>
      </div>
    </section>
  )
}
