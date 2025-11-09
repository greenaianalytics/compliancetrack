'use client'

import { useState } from 'react'
import { CalendarTask } from '@/types/calendar'

interface CalendarProps {
  tasks: CalendarTask[]
  onDateClick: (date: Date, tasks: CalendarTask[]) => void
  onTaskClick?: (task: CalendarTask) => void
}

export default function Calendar({ tasks, onDateClick, onTaskClick }: CalendarProps) {
  const [currentView, setCurrentView] = useState<'month' | 'year'>('year')
  const [currentDate, setCurrentDate] = useState(new Date())

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const getMonthTasks = (month: number) => {
    const monthTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date)
      return taskDate.getMonth() === month && taskDate.getFullYear() === currentDate.getFullYear()
    })
    
    const pending = monthTasks.filter(t => t.status === 'pending').length
    const completed = monthTasks.filter(t => t.status === 'completed').length
    
    return { pending, completed, total: monthTasks.length }
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Compliance Calendar</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateYear('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            ←
          </button>
          <span className="text-lg font-medium text-gray-900">
            {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateYear('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map((month, index) => {
          const monthTasks = getMonthTasks(index)
          
          return (
            <div
              key={month}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                // Create a date for the first day of the month
                const firstDay = new Date(currentDate.getFullYear(), index, 1)
                const monthTasksList = tasks.filter(task => {
                  const taskDate = new Date(task.due_date)
                  return taskDate.getMonth() === index && taskDate.getFullYear() === currentDate.getFullYear()
                })
                onDateClick(firstDay, monthTasksList)
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">{month}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {monthTasks.total} tasks
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">✓ {monthTasks.completed} done</span>
                  <span className="text-orange-600">● {monthTasks.pending} pending</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: monthTasks.total > 0 
                        ? `${(monthTasks.completed / monthTasks.total) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
                
                {/* Quick status */}
                {monthTasks.total === 0 && (
                  <p className="text-xs text-gray-500 text-center">No tasks</p>
                )}
                {monthTasks.completed === monthTasks.total && monthTasks.total > 0 && (
                  <p className="text-xs text-green-600 text-center">All complete! 🎉</p>
                )}
                {monthTasks.pending > 0 && (
                  <p className="text-xs text-orange-600 text-center">
                    {monthTasks.pending} to complete
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-600 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>No Tasks</span>
          </div>
        </div>
      </div>
    </div>
  )
}