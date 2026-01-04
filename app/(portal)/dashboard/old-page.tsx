'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { createBrowserClient } from '@/lib/supabase'
import { calculateHealthScore, formatTaskName } from '@/lib/utils'
import HealthSpeedometer from '@/components/health-speedometer'
import ConfirmCompletionModal from '@/components/confirm-completion-modal'
import Header from '@/components/header'

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
  evidence_required?: boolean
  weekend_policy?: string
}

interface HealthScore {
  overall: number
  completed: number
  total: number
  byCategory: Record<string, number>
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [smeProfile, setSmeProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [healthScore, setHealthScore] = useState<HealthScore>({
    overall: 0,
    completed: 0,
    total: 0,
    byCategory: {}
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean
    taskId: string
    taskName: string
    dueDate: string
  }>({
    isOpen: false,
    taskId: '',
    taskName: '',
    dueDate: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        await loadTasks(currentUser.id)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async (userId: string) => {
    const supabase = createBrowserClient()
    
    // Get user's SME profile to find their organization
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

    // Load both compliance tasks and custom tasks for the organization
    const { data: complianceTasks, error: complianceError } = await supabase
      .from('sme_compliance_status')
      .select(`
        id,
        status,
        due_date,
        completed_at,
        compliance_tasks (
          id,
          task_name,
          description,
          priority,
          category,
          evidence_required,
          weekend_policy
        )
      `)
      .eq('sme_id', smeProfile.id)

    const { data: customTasks, error: customError } = await supabase
      .from('custom_tasks')
      .select('*')
      .eq('sme_id', smeProfile.id)

    if (complianceError) console.error('Error loading compliance tasks:', complianceError)
    if (customError) console.error('Error loading custom tasks:', customError)

    // Combine and transform tasks
    const allTasks: Task[] = []

    // Add compliance tasks
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
            evidence_required: task.compliance_tasks.evidence_required,
            weekend_policy: task.compliance_tasks.weekend_policy
          })
        }
      })
    }

    if (customTasks) {
      customTasks.forEach(task => {
        allTasks.push({
          id: task.id,
          task_name: task.task_name,
          description: task.description,
          due_date: task.due_date,
          status: task.status,
          category: task.category?.category_name || 'Custom',
          priority: 'medium',
          is_custom: true,
          created_by: task.created_by,
          evidence_required: task.evidence_required || false,
          weekend_policy: 'next_business_day' // Default for custom tasks
        })
      })
    }

    setTasks(allTasks)
    calculateHealthMetrics(allTasks)
  }

  const calculateHealthMetrics = (tasks: Task[]) => {
    const visibleTasks = tasks.filter(task => task.status !== 'hidden')
    const completedTasks = visibleTasks.filter(task => task.status === 'completed')
    
    const byCategory: Record<string, number> = {}
    const categories = [...new Set(visibleTasks.map(task => task.category))]

    categories.forEach(category => {
      const categoryTasks = visibleTasks.filter(task => task.category === category)
      const completedCategoryTasks = categoryTasks.filter(task => task.status === 'completed')
      byCategory[category] = calculateHealthScore(completedCategoryTasks.length, categoryTasks.length)
    })

    setHealthScore({
      overall: calculateHealthScore(completedTasks.length, visibleTasks.length),
      completed: completedTasks.length,
      total: visibleTasks.length,
      byCategory
    })
  }

  const updateTaskStatus = async (taskId: string, newStatus: 'completed' | 'pending' | 'hidden') => {
    const supabase = createBrowserClient()
    
    // Determine if it's a compliance task or custom task
    const task = tasks.find(t => t.id === taskId)
    
    if (task?.is_custom) {
      // Update custom task
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
      // Update compliance task
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

    // Reload tasks to reflect changes
    await loadTasks(user.id)
  }

  const handleCompleteClick = (taskId: string, taskName: string, dueDate: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task?.status === 'completed') return

    setCompletionModal({
      isOpen: true,
      taskId,
      taskName,
      dueDate
    })
  }

  const confirmCompletion = async () => {
    await updateTaskStatus(completionModal.taskId, 'completed')
    setCompletionModal({ isOpen: false, taskId: '', taskName: '', dueDate: '' })
  }

  const getUpcomingTasks = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return tasks
      .filter(task => task.status === 'pending' && new Date(task.due_date) <= nextWeek)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5)
  }

  const handleAddCustomTask = () => {
    router.push('/tasks?action=create')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<header className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo only - no text */}
      <div className="flex items-center">
        <img 
          src="/logo.png" 
          alt="Compliance Track" 
          className="h-10 w-auto" // Adjust height as needed for your rectangular logo
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Welcome, {user?.email}
        </span>
        <button
          onClick={() => router.push('/settings')}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Settings
        </button>
        <button
          onClick={async () => {
            await signOut()
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Health Score & Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Health Score Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Compliance Health Score
                </h2>
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="lg:mr-8 mb-6 lg:mb-0">
                    <HealthSpeedometer 
                      score={healthScore.overall} 
                      size="lg" 
                      showLabel={false}
                      animate={true}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4 text-center lg:text-left">
                      {healthScore.completed} of {healthScore.total} tasks completed
                    </p>
                    <div className="space-y-3">
                      {Object.entries(healthScore.byCategory).map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full transition-colors duration-300"
                              style={{ 
                                backgroundColor: score >= 80 ? '#10B981' :
                                              score >= 60 ? '#84CC16' :
                                              score >= 40 ? '#F59E0B' :
                                              score >= 20 ? '#F97316' : '#EF4444'
                              }}
                            />
                            <span className="text-sm text-gray-600">{category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{score}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${score}%`,
                                  backgroundColor: score >= 80 ? '#10B981' :
                                                score >= 60 ? '#84CC16' :
                                                score >= 40 ? '#F59E0B' :
                                                score >= 20 ? '#F97316' : '#EF4444'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Tasks ({tasks.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push('/tasks')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      View All Tasks
                    </button>
                    <button 
                      onClick={handleAddCustomTask}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      + Add Custom Task
                    </button>
                  </div>
                </div>
                
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks found.</p>
                    <button 
                      onClick={handleAddCustomTask}
                      className="mt-2 text-blue-600 hover:text-blue-500"
                    >
                      Create your first task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 10).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
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
                          <h3 className="font-medium text-gray-900">{task.task_name}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-sm text-gray-500">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">•</p>
                            <p className="text-sm text-gray-500">{task.category}</p>
                          </div>
                          
                          {/* Weekend Policy and Evidence Required - Compact single line */}
<div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100 flex-nowrap overflow-x-auto">
  {/* Evidence Required Badge */}
  {task.evidence_required && (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap flex-shrink-0 min-w-0">
      📎 Evidence Required
    </span>
                            )}
                            
                              {/* Weekend Policy Badge */}
  {task.weekend_policy && task.weekend_policy !== 'ignore' && (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap flex-shrink-0 min-w-0">
      {task.weekend_policy === 'previous_business_day' ? '📅 Prev business day' : 
       task.weekend_policy === 'next_business_day' ? '📅 Next business day' : 
       `📅 ${task.weekend_policy}`}
    </span>
                            )}
                            
                            {/* Show if no special badges */}
                            {!task.evidence_required && (!task.weekend_policy || task.weekend_policy === 'ignore') && (
                              <span className="text-xs text-gray-400">No special requirements</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCompleteClick(task.id, task.task_name, task.due_date)}
                            disabled={task.status === 'completed'}
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {task.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'hidden')}
                            className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            👁 Hide
                          </button>
                        </div>
                      </div>
                    ))}
                    {tasks.length > 10 && (
                      <div className="text-center pt-4">
                        <button 
                          onClick={() => router.push('/tasks')}
                          className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                          View all {tasks.length} tasks →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Upcoming Tasks & Quick Stats */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upcoming Tasks
                </h2>
                <div className="space-y-3">
                  {getUpcomingTasks().length > 0 ? (
                    getUpcomingTasks().map(task => (
                      <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{task.task_name}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">{task.category}</p>
                            
                            {/* Small badges for upcoming tasks */}
                            <div className="flex items-center space-x-1 mt-2">
                              {task.evidence_required && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  📎
                                </span>
                              )}
                              {task.weekend_policy && task.weekend_policy !== 'ignore' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  📅
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No upcoming tasks</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="text-sm font-medium text-gray-900">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-green-600">
                      {tasks.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {tasks.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hidden</span>
                    <span className="text-sm font-medium text-gray-600">
                      {tasks.filter(t => t.status === 'hidden').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/tasks')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    📋 View All Tasks
                  </button>
                  <button
                    onClick={handleAddCustomTask}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    ➕ Add Custom Task
                  </button>
                  <button
                    onClick={() => router.push('/calendar')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    📅 View Calendar
                  </button>
                  <button
                    onClick={() => router.push('/knowledge')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    📚 Knowledge Hub
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmCompletionModal
        isOpen={completionModal.isOpen}
        onClose={() => setCompletionModal({ isOpen: false, taskId: '', taskName: '', dueDate: '' })}
        onConfirm={confirmCompletion}
        taskName={completionModal.taskName}
        dueDate={completionModal.dueDate}
      />
    </div>
  )
}
