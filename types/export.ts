export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel'
  dateRange: {
    start: string
    end: string
  }
  includeCompleted: boolean
  includePending: boolean
  includeCustomTasks: boolean
  includeComplianceTasks: boolean
  groupByCategory: boolean
  includeEvidence: boolean
}

export interface ExportData {
  tasks: any[]
  summary: {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
  }
  metadata: {
    exportedAt: string
    businessName: string
    dateRange: string
    exportType: string
  }
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'pdf',
  dateRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0], // Today
  },
  includeCompleted: true,
  includePending: true,
  includeCustomTasks: true,
  includeComplianceTasks: true,
  groupByCategory: true,
  includeEvidence: false,
}