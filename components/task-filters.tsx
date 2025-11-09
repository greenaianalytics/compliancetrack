'use client'

import { TaskFilters, DEFAULT_FILTERS } from '@/types/filters'
import { Task } from '@/types/tasks'
import { getUniqueCategories } from '@/lib/filter-utils'

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  tasks: Task[]
  filterStats: {
    totalTasks: number
    visibleTasks: number
    completedTasks: number
    customTasks: number
    complianceTasks: number
    completionRate: number
  }
}

export default function TaskFiltersComponent({ 
  filters, 
  onFiltersChange, 
  tasks,
  filterStats 
}: TaskFiltersProps) {
  const categories = getUniqueCategories(tasks)

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS)
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== ''
    return value !== 'all'
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* Filter Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{filterStats.totalTasks}</div>
          <div className="text-sm text-blue-600">Total Tasks</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{filterStats.completedTasks}</div>
          <div className="text-sm text-green-600">Completed</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{filterStats.customTasks}</div>
          <div className="text-sm text-purple-600">Custom</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{filterStats.complianceTasks}</div>
          <div className="text-sm text-orange-600">Compliance</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{filterStats.visibleTasks}</div>
          <div className="text-sm text-gray-600">Filtered</div>
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{filterStats.completionRate}%</div>
          <div className="text-sm text-indigo-600">Complete</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Task Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
          <select
            value={filters.taskType}
            onChange={(e) => handleFilterChange('taskType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="compliance">Compliance</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <select
            value={filters.dueDate}
            onChange={(e) => handleFilterChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Next 7 Days</option>
            <option value="month">Next 30 Days</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}