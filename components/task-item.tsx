'use client'

import { useState } from 'react'
import ConfirmCompletionModal from './confirm-completion-modal'

interface TaskItemProps {
  task: {
    id: string
    task_name: string
    description?: string
    due_date: string
    status: 'pending' | 'completed' | 'hidden'
    category: string
    priority: 'high' | 'medium' | 'low'
    is_custom: boolean
    weekend_policy?: 'previous_business_day' | 'next_business_day' | 'same_day'
    evidence_required?: boolean
  }
  onStatusChange: (taskId: string, newStatus: 'completed' | 'pending' | 'hidden') => void
}

export default function TaskItem({ task, onStatusChange }: TaskItemProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleCompleteClick = () => {
    const isFutureDue = new Date(task.due_date) > new Date()
    
    if (isFutureDue) {
      setShowConfirmModal(true)
    } else {
      onStatusChange(task.id, 'completed')
    }
  }

  const handleConfirmComplete = () => {
    onStatusChange(task.id, 'completed')
    setShowConfirmModal(false)
  }

  const getWeekendPolicyText = (policy: string) => {
    switch (policy) {
      case 'previous_business_day': return 'Due previous business day'
      case 'next_business_day': return 'Due next business day'
      case 'same_day': return 'Due same day'
      default: return null
    }
  }

  const weekendPolicyText = task.weekend_policy ? getWeekendPolicyText(task.weekend_policy) : null

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-1">
          {/* Task Tags */}
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            {/* Priority */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {task.priority}
            </span>

            {/* Custom Task */}
            {task.is_custom && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Custom
              </span>
            )}

            {/* Status */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'completed' ? 'bg-green-100 text-green-800' :
              task.status === 'hidden' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status}
            </span>

            {/* Evidence Required */}
            {task.evidence_required && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                📎 Evidence Required
              </span>
            )}

            {/* Weekend Policy */}
            {weekendPolicyText && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                🗓️ {weekendPolicyText}
              </span>
            )}
          </div>

          {/* Task Content */}
          <h3 className="font-medium text-gray-900 text-sm">{task.task_name}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          
          {/* Task Meta */}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Due: {new Date(task.due_date).toLocaleDateString('en-IE')}</span>
            <span>•</span>
            <span>{task.category}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleCompleteClick}
            disabled={task.status === 'completed'}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {task.status === 'completed' ? '✓ Done' : 'Complete'}
          </button>
          <button
            onClick={() => onStatusChange(task.id, 'hidden')}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            👁 Hide
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmCompletionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmComplete}
        taskName={task.task_name}
        dueDate={task.due_date}
      />
    </>
  )
}