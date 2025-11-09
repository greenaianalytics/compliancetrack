'use client'

import { useState } from 'react'
import { useProtectedRoute } from '@/lib/protected-route'
import { getCurrentUser } from '@/lib/auth'
import ExportModal from '@/components/export/export-modal'
import { ExportOptions } from '@/types/export'
import { generateExportData, generateCSV, generateExcel, generatePDF, downloadFile } from '@/lib/export-api'

export default function ExportPage() {
  useProtectedRoute()
  
  const [showExportModal, setShowExportModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [recentExports, setRecentExports] = useState<any[]>([])

  // Load user on component mount
  useState(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  })

  const handleExport = async (options: ExportOptions) => {
    if (!user) return

    try {
      const exportData = await generateExportData(user.id, options)
      
      const filename = `compliance-report-${new Date().toISOString().split('T')[0]}`

      switch (options.format) {
        case 'csv':
          const csvContent = generateCSV(exportData)
          downloadFile(csvContent, `${filename}.csv`, 'text/csv')
          break
          
        case 'excel':
          const excelBlob = await generateExcel(exportData)
          downloadFile(excelBlob, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          break
          
        case 'pdf':
          const pdfBlob = await generatePDF(exportData)
          downloadFile(pdfBlob, `${filename}.pdf`, 'application/pdf')
          break
      }
      
      // Add to recent exports
      setRecentExports(prev => [{
        id: Date.now(),
        type: options.format.toUpperCase(),
        date: new Date().toISOString(),
        options,
      }, ...prev.slice(0, 4)]) // Keep only last 5
      
    } catch (error) {
      console.error('Export error:', error)
      throw new Error('Failed to generate export. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Export Reports — by GreenAI Analytics
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm border rounded-lg">
            {/* Main Content */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📤</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Export Compliance Data
              </h2>
              
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Generate comprehensive reports of your compliance tasks, progress, and status. 
                Export in multiple formats for sharing with stakeholders, auditors, or for your records.
              </p>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Start New Export
              </button>
            </div>

            {/* Recent Exports */}
            {recentExports.length > 0 && (
              <div className="border-t p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
                <div className="space-y-3">
                  {recentExports.map(exportItem => (
                    <div key={exportItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {exportItem.type === 'PDF' ? '📄' : exportItem.type === 'CSV' ? '📊' : '📈'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {exportItem.type} Report
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(exportItem.date).toLocaleDateString()} at{' '}
                            {new Date(exportItem.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Option to re-export with same settings
                          setShowExportModal(true)
                          // You could pre-fill the options here
                        }}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Export Again
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Types Info */}
            <div className="border-t p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <h4 className="font-medium text-gray-900 mb-1">PDF Report</h4>
                  <p className="text-sm text-gray-600">
                    Professional formatted report with summary, perfect for sharing with stakeholders.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-medium text-gray-900 mb-1">CSV Data</h4>
                  <p className="text-sm text-gray-600">
                    Raw data export for analysis in spreadsheets or data processing tools.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-medium text-gray-900 mb-1">Excel Format</h4>
                  <p className="text-sm text-gray-600">
                    Excel-compatible format with formatted columns and data validation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  )
}