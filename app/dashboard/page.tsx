import Link from 'next/link'

interface Task {
  id: string
  task_name: string
  due_date: string
  status: 'pending' | 'completed'
  is_custom: boolean
}

const initialTasks: Task[] = [
  {
    id: '1',
    task_name: 'GDPR Audit 2026',
    due_date: '2026-05-01',
    status: 'pending',
    is_custom: false,
  },
  {
    id: '2',
    task_name: 'Custom staff training',
    due_date: '2026-05-12',
    status: 'completed',
    is_custom: true,
  },
]

export default function DashboardPage() {
  return (
    <section className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
        </div>
        <p className="text-gray-600 mb-6">Use this area to track your compliance tasks. This is a minimal starter screen.</p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-2 border">Task</th>
              <th className="px-4 py-2 border">Due</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Type</th>
            </tr>
          </thead>
          <tbody>
            {initialTasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{task.task_name}</td>
                <td className="px-4 py-2 border">{task.due_date}</td>
                <td className="px-4 py-2 border">{task.status}</td>
                <td className="px-4 py-2 border">{task.is_custom ? 'Custom' : 'Built-in'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
