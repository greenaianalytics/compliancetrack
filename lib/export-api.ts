import { createBrowserClient } from './supabase'
import { ExportOptions, ExportData } from '@/types/export'

export const generateExportData = async (userId: string, options: ExportOptions): Promise<ExportData> => {
  const supabase = createBrowserClient()
  
  // Get SME profile
  const { data: smeProfile, error: profileError } = await supabase
    .from('sme_profiles')
    .select('id, business_name')
    .eq('user_id', userId)
    .single()

  if (profileError || !smeProfile) {
    throw new Error('SME profile not found')
  }

  // Build query for tasks
  let tasksQuery = supabase
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
        legal_reference
      )
    `)
    .eq('sme_id', smeProfile.id)

  // Apply date range filter
  if (options.dateRange.start && options.dateRange.end) {
    tasksQuery = tasksQuery
      .gte('due_date', options.dateRange.start)
      .lte('due_date', options.dateRange.end)
  }

  // Apply status filters
  const statusFilters = []
  if (options.includeCompleted) statusFilters.push('completed')
  if (options.includePending) statusFilters.push('pending')
  
  if (statusFilters.length > 0) {
    tasksQuery = tasksQuery.in('status', statusFilters)
  }

  const { data: complianceTasks, error: complianceError } = await tasksQuery

  if (complianceError) {
    console.error('Error loading compliance tasks:', complianceError)
  }

  // Load custom tasks if included
  let customTasks: any[] = []
  if (options.includeCustomTasks) {
    const { data: customTasksData, error: customError } = await supabase
      .from('custom_tasks')
      .select(`
        *,
        category:custom_categories(category_name)
      `)
      .eq('sme_id', smeProfile.id)
      .in('status', statusFilters)

    if (!customError && customTasksData) {
      customTasks = customTasksData
    }
  }

  // Combine and transform tasks
  const allTasks: any[] = []

  // Add compliance tasks
  if (complianceTasks && options.includeComplianceTasks) {
    complianceTasks.forEach(task => {
      if (task.compliance_tasks) {
        allTasks.push({
          id: task.id,
          type: 'compliance',
          task_name: task.compliance_tasks.task_name,
          description: task.compliance_tasks.description,
          due_date: task.due_date,
          status: task.status,
          category: task.compliance_tasks.category,
          priority: task.compliance_tasks.priority,
          legal_reference: task.compliance_tasks.legal_reference,
          completed_at: task.completed_at,
          is_overdue: task.status === 'pending' && new Date(task.due_date) < new Date(),
        })
      }
    })
  }

  // Add custom tasks
  if (options.includeCustomTasks) {
    customTasks.forEach(task => {
      allTasks.push({
        id: task.id,
        type: 'custom',
        task_name: task.task_name,
        description: task.description,
        due_date: task.due_date,
        status: task.status,
        category: task.category?.category_name || 'Custom',
        priority: 'medium',
        legal_reference: '',
        completed_at: task.completed_at,
        is_overdue: task.status === 'pending' && new Date(task.due_date) < new Date(),
      })
    })
  }

  // Calculate summary
  const total = allTasks.length
  const completed = allTasks.filter(task => task.status === 'completed').length
  const pending = allTasks.filter(task => task.status === 'pending').length
  const overdue = allTasks.filter(task => task.is_overdue).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    tasks: allTasks,
    summary: {
      total,
      completed,
      pending,
      overdue,
      completionRate,
    },
    metadata: {
      exportedAt: new Date().toISOString(),
      businessName: smeProfile.business_name,
      dateRange: `${options.dateRange.start} to ${options.dateRange.end}`,
      exportType: 'Compliance Tasks Report',
    },
  }
}

export const generateCSV = (exportData: ExportData): string => {
  const headers = ['Task Name', 'Type', 'Category', 'Status', 'Priority', 'Due Date', 'Completed Date', 'Description', 'Legal Reference']
  
  const rows = exportData.tasks.map(task => [
    task.task_name,
    task.type,
    task.category,
    task.status,
    task.priority,
    task.due_date,
    task.completed_at || '',
    task.description || '',
    task.legal_reference || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field?.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  return csvContent
}

export const generateExcel = async (exportData: ExportData): Promise<Blob> => {
  // For Excel export, we'll use a simple CSV approach
  // In a real implementation, you might use a library like SheetJS
  const csvContent = generateCSV(exportData)
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
}

export const downloadFile = (content: Blob | string, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}