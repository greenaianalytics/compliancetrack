'use client'

import { ExportOptions, DEFAULT_EXPORT_OPTIONS } from '@/types/export'

interface ExportOptionsProps {
  options: ExportOptions
  onOptionsChange: (options: ExportOptions) => void
  isExporting: boolean
}

export default function ExportOptionsComponent({ 
  options, 
  onOptionsChange, 
  isExporting 
}: ExportOptionsProps) {
  const handleChange = (key: keyof ExportOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value
    })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onOptionsChange({
      ...options,
      dateRange: {
        ...options.dateRange,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Export Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'pdf', label: 'PDF Report', icon: '📄' },
            { value: 'csv', label: 'CSV Data', icon: '📊' },
            { value: 'excel', label: 'Excel', icon: '📈' },
          ].map(format => (
            <button
              key={format.value}
              type="button"
              onClick={() => handleChange('format', format.value)}
              disabled={isExporting}
              className={`
                p-4 border-2 rounded-lg text-center transition-all
                ${options.format === format.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-2xl mb-2">{format.icon}</div>
              <div className="text-sm font-medium text-gray-900">{format.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={options.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              disabled={isExporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={options.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              disabled={isExporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Task Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Include Task Types
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeComplianceTasks}
              onChange={(e) => handleChange('includeComplianceTasks', e.target.checked)}
              disabled={isExporting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Compliance Tasks</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeCustomTasks}
              onChange={(e) => handleChange('includeCustomTasks', e.target.checked)}
              disabled={isExporting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Custom Tasks</span>
          </label>
        </div>
      </div>

      {/* Task Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Include Task Status
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeCompleted}
              onChange={(e) => handleChange('includeCompleted', e.target.checked)}
              disabled={isExporting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Completed Tasks</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includePending}
              onChange={(e) => handleChange('includePending', e.target.checked)}
              disabled={isExporting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Pending Tasks</span>
          </label>
        </div>
      </div>

      {/* Additional Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Additional Options
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.groupByCategory}
              onChange={(e) => handleChange('groupByCategory', e.target.checked)}
              disabled={isExporting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Group by Category</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeEvidence}
              onChange={(e) => handleChange('includeEvidence', e.target.checked)}
              disabled={isExporting}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Include Evidence Links</span>
          </label>
        </div>
      </div>
    </div>
  )
}