'use client'

import { useEffect, useState } from 'react'
import { useProtectedRoute } from '@/lib/protected-route'
import { createBrowserClient } from '@/lib/supabase'
import Calendar from '@/components/calendar'
import DateDetailModal from '@/components/date-detail-modal'
import { CalendarTask } from '@/types/calendar'

// Helper function to format task names
const formatTaskName = (taskName: string): string => {
  // Replace underscores with spaces and capitalize first letter of each word
  return taskName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default function CalendarPage() {
  useProtectedRoute()
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateTasks, setSelectedDateTasks] = useState<CalendarTask[]>([])
  const [showDateModal, setShowDateModal] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get user's SME profile
    const { data: smeProfile } = await supabase
      .from('sme_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!smeProfile) return

    // Load compliance tasks
    const { data: complianceTasks } = await supabase
      .from('sme_compliance_status')
      .select(`
        id,
        status,
        due_date,
        compliance_tasks (
          task_name,
          category,
          priority
        )
      `)
      .eq('sme_id', smeProfile.id)

    // Load custom tasks
    const { data: customTasks } = await supabase
      .from('custom_tasks')
      .select('*')
      .eq('sme_id', smeProfile.id)

    const allTasks: CalendarTask[] = []

    if (complianceTasks) {
      complianceTasks.forEach(task => {
        if (task.compliance_tasks) {
          allTasks.push({
            id: task.id,
            task_name: formatTaskName(task.compliance_tasks.task_name), // Format the task name
            due_date: task.due_date,
            status: task.status,
            category: task.compliance_tasks.category,
            priority: task.compliance_tasks.priority,
            is_custom: false
          })
        }
      })
    }

    if (customTasks) {
      customTasks.forEach(task => {
        allTasks.push({
          id: task.id,
          task_name: formatTaskName(task.task_name), // Format the task name
          due_date: task.due_date,
          status: task.status,
          category: 'Custom',
          priority: 'medium',
          is_custom: true
        })
      })
    }

    setTasks(allTasks)
    setLoading(false)
  }

  const handleDateClick = (date: Date, tasks: CalendarTask[]) => {
    setSelectedDate(date)
    setSelectedDateTasks(tasks)
    setShowDateModal(true)
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: 'completed' | 'pending') => {
    const supabase = createBrowserClient()
    
    // Update task status (you'll need to implement this based on your update logic)
    console.log('Update task:', taskId, newStatus)
    
    // Reload tasks to reflect changes
    await loadTasks()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
            <button
              onClick={() => window.history.back()}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Calendar 
            tasks={tasks}
            onDateClick={handleDateClick}
          />
        </div>
      </div>

      <DateDetailModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        date={selectedDate}
        tasks={selectedDateTasks}
        onTaskStatusChange={handleTaskStatusChange}
      />
    </div>
  )
}