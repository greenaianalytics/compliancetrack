'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createBrowserClient } from '@/lib/supabase'
import { ensureTasksForYear } from '@/lib/task-materializer'
import { formatTaskName } from '@/lib/utils'
import YearSelector from '@/components/year-selector'

interface Task {
  id: string
  task_name: string
  description?: string
  due_date: string
  status: 'pending' | 'completed' | 'hidden'
  category: string
  priority: 'high' | 'medium' | 'low'
  is_custom: boolean
  created_by?: string
  task_year: number
}

interface TaskFilters {
  status: string
  priority: string
  category: string
  search: string
}

export default function TasksPage() {
  const [user, setUser] = useState<any>(null)
  const [smeProfile, setSmeProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'Custom'
  })
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      setShowCreateModal(true)
    }
    loadTasksData()
  }, [])

  // Reload tasks when year changes
  useEffect(() => {
    if (user && selectedYear) {
      loadTasks(user.id, selectedYear)
    }
  }, [selectedYear])

  useEffect(() => {
    filterTasks()
  }, [tasks, filters])

  const loadTasksData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        await loadTasks(currentUser.id, selectedYear)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load available years for this SME
  const loadAvailableYears = async (smeId: string) => {
    const supabase = createBrowserClient()
    const currentYear = new Date().getFullYear()
    
    // Ensure current year has tasks materialized
    await ensureTasksForYear(smeId, currentYear)

    const { data } = await supabase
      .from('sme_compliance_status')
      .select('task_year')
      .eq('sme_id', smeId)
      .order('task_year', { ascending: false })

    if (data) {
      const yearsSet = new Set(data.map(item => item.task_year))
      yearsSet.add(currentYear)
      const years = Array.from(yearsSet).sort((a, b) => b - a)
      setAvailableYears(years.length > 0 ? years : [currentYear])
    } else {
      setAvailableYears([currentYear])
    }
  }

  const loadTasks = async (userId: string, year?: number) => {
    const taskYear = year || selectedYear
    const supabase = createBrowserClient()
    
    const { data: smeProfile, error: profileError } = await supabase
      .from('sme_profiles')
      .select('id, business_name')
      .eq('user_id', userId)
      .single()

    if (profileError || !smeProfile) {
      console.error('Error loading SME profile:', profileError)
      return
    }

    setSmeProfile(smeProfile)
    await loadAvailableYears(smeProfile.id)

    // Load both compliance tasks and custom tasks filtered by year
    const { data: complianceTasks, error: complianceError } = await supabase
      .from('sme_compliance_status')
      .select(`
        id,
        status,
        due_date,
        task_year,
        completed_at,
        compliance_tasks (
          id,
          task_name,
          description,
          priority,
          category
        )
      `)
      .eq('sme_id', smeProfile.id)
      .eq('task_year', taskYear)

    const { data: customTasks, error: customError } = await supabase
      .from('custom_tasks')
      .select('*')
      .eq('sme_id', smeProfile.id)
      .eq('task_year', taskYear)

    if (complianceError) console.error('Error loading compliance tasks:', complianceError)
    if (customError) console.error('Error loading custom tasks:', customError)

    const allTasks: Task[] = []

    if (complianceTasks) {
      complianceTasks.forEach(task => {
        if (task.compliance_tasks) {
          allTasks.push({
            id: task.id,
            task_name: formatTaskName(task.compliance_tasks.task_name),
            description: task.compliance_tasks.description,
            due_date: task.due_date,
            status: task.status,
            category: task.compliance_tasks.category,
            priority: task.compliance_tasks.priority,
            is_custom: false,
            task_year: task.task_year
          })
        }
      })
    }

    if (customTasks) {
      customTasks.forEach(task => {
        allTasks.push({
          id: task.id,
          task_name: formatTaskName(task.task_name),
          description: task.description,
          due_date: task.due_date,
          status: task.status,
          category: 'Custom',
          priority: 'medium',
          is_custom: true,
          created_by: task.created_by,
          task_year: task.task_year || taskYear
        })
      })
    }

    setTasks(allTasks)
  }

  const filterTasks = () => {
    let filtered = tasks

    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(task => task.category === filters.category)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.task_name.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        task.category.toLowerCase().includes(searchLower)
      )
    }

    setFilteredTasks(filtered)
  }

  const updateTaskStatus = async (taskId: string, newStatus: 'completed' | 'pending' | 'hidden') => {
    const supabase = createBrowserClient()
    const task = tasks.find(t => t.id === taskId)
    
    if (task?.is_custom) {
      const { error } = await supabase
        .from('custom_tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)
      
      if (error) {
        console.error('Error updating custom task:', error)
        return
      }
    } else {
      const { error } = await supabase
        .from('sme_compliance_status')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)
      
      if (error) {
        console.error('Error updating compliance task:', error)
        return
      }
    }

    await loadTasks(user.id, selectedYear)
  }

  const createCustomTask = async () => {
    if (!newTask.task_name || !newTask.due_date) {
      alert('Please fill in all required fields')
      return
    }

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('custom_tasks')
      .insert({
        sme_id: smeProfile.id,
        task_name: newTask.task_name,
        description: newTask.description,
        due_date: newTask.due_date,
        priority: newTask.priority,
        status: 'pending',
        task_year: selectedYear
      })

    if (error) {
      console.error('Error creating task:', error)
      alert('Error creating task')
    } else {
      setShowCreateModal(false)
      setNewTask({
        task_name: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'Custom'
      })
      await loadTasks(user.id, selectedYear)
    }
  }

  const getCategories = () => {
    return [...new Set(tasks.map(task => task.category))]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Year Selector */}
          <div className="mb-6 flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Year:</label>
            <YearSelector 
              selectedYear={selectedYear} 
              availableYears={availableYears}
              onYearChange={setSelectedYear}
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Search tasks..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              All Tasks ({filteredTasks.length})
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add Custom Task
            </button>
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No tasks found matching your filters.</p>
                <button
                  onClick={() => setFilters({status: 'all', priority: 'all', category: 'all', search: ''})}
                  className="mt-2 text-blue-600 hover:text-blue-500"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTasks.map(task => (
                  <div key={task.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                          {task.is_custom && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Custom
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'hidden' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{task.task_name}</h3>
                        {task.description && (
                          <p className="text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{task.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          disabled={task.status === 'completed'}
                          className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {task.status === 'completed' ? '✓ Done' : 'Complete'}
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'hidden')}
                          className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          👁 Hide
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Custom Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                <input
                  type="text"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter task name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createCustomTask}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}