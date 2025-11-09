'use client'

import { CalendarTask } from '@/types/calendar'

interface DateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date | null
  tasks: CalendarTask[]
  onTaskStatusChange?: (taskId: string, newStatus: 'completed' | 'pending') => void
}

export default function DateDetailModal({ 
  isOpen, 
  onClose, 
  date, 
  tasks, 
  onTaskStatusChange 
}: DateDetailModalProps) {
  if (!isOpen || !date) return null

  const handleTaskClick = (task: CalendarTask) => {
    if (onTaskStatusChange && task.status === 'pending') {
      onTaskStatusChange(task.id, 'completed')
    } else if (onTaskStatusChange && task.status === 'completed') {
      onTaskStatusChange(task.id, 'pending')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'hidden': return '👁'
      default: return '⏳'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tasks for {date.toLocaleDateString('en-IE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tasks List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${task.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-sm ${
                          task.status === 'completed' ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {getStatusIcon(task.status)}
                        </span>
                        <span className={`text-sm ${
                          task.status === 'completed' ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {getPriorityIcon(task.priority)}
                        </span>
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'}
                        `}>
                          {task.priority}
                        </span>
                        {task.is_custom && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <h3 className={`
                        font-medium mb-1
                        ${task.status === 'completed' ? 'text-green-800 line-through' : 'text-gray-900'}
                      `}>
                        {task.task_name}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>Due: {new Date(task.due_date).toLocaleTimeString('en-IE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskClick(task)
                        }}
                        className={`
                          px-3 py-1 text-sm rounded-md transition-colors
                          ${task.status === 'completed'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                          }
                        `}
                      >
                        {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
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
  )
}