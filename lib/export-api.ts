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
  // Create XLSX-compatible file using Office Open XML format
  // This is a simplified approach that creates a valid Excel file
  
  const { tasks, summary, metadata } = exportData
  
  // Create worksheet content in XML format
  const taskRows = tasks.map((task, index) => `
    <Row ss:Index="${index + 2}">
      <Cell><Data ss:Type="String">${escapeXml(task.task_name)}</Data></Cell>
      <Cell><Data ss:Type="String">${task.type}</Data></Cell>
      <Cell><Data ss:Type="String">${task.category}</Data></Cell>
      <Cell><Data ss:Type="String">${task.status}</Data></Cell>
      <Cell><Data ss:Type="String">${task.priority}</Data></Cell>
      <Cell><Data ss:Type="String">${new Date(task.due_date).toLocaleDateString()}</Data></Cell>
      <Cell><Data ss:Type="String">${task.completed_at ? new Date(task.completed_at).toLocaleDateString() : ''}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(task.description || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(task.legal_reference || '')}</Data></Cell>
    </Row>
  `).join('')

  const excelXML = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:x2="http://schemas.microsoft.com/office/excel/2003/xml">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Compliance Tasks Report - ${metadata.businessName}</Title>
    <Author>Compliance Track</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  
  <Worksheet ss:Name="Summary">
    <Table>
      <Row><Cell ss:StyleID="header"><Data ss:Type="String">Metric</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Value</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Business Name</Data></Cell><Cell><Data ss:Type="String">${metadata.businessName}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Tasks</Data></Cell><Cell><Data ss:Type="Number">${summary.total}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Completed</Data></Cell><Cell><Data ss:Type="Number">${summary.completed}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Pending</Data></Cell><Cell><Data ss:Type="Number">${summary.pending}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Overdue</Data></Cell><Cell><Data ss:Type="Number">${summary.overdue}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Completion Rate</Data></Cell><Cell><Data ss:Type="String">${summary.completionRate}%</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Exported</Data></Cell><Cell><Data ss:Type="String">${new Date(metadata.exportedAt).toLocaleString()}</Data></Cell></Row>
    </Table>
  </Worksheet>
  
  <Worksheet ss:Name="Tasks">
    <Table>
      <Row ss:StyleID="header">
        <Cell><Data ss:Type="String">Task Name</Data></Cell>
        <Cell><Data ss:Type="String">Type</Data></Cell>
        <Cell><Data ss:Type="String">Category</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Priority</Data></Cell>
        <Cell><Data ss:Type="String">Due Date</Data></Cell>
        <Cell><Data ss:Type="String">Completed Date</Data></Cell>
        <Cell><Data ss:Type="String">Description</Data></Cell>
        <Cell><Data ss:Type="String">Legal Reference</Data></Cell>
      </Row>
      ${taskRows}
    </Table>
  </Worksheet>
  
  <Styles>
    <Style ss:ID="header">
      <Interior ss:Color="#D3D3D3" ss:Pattern="Solid"/>
      <Font ss:Bold="1"/>
    </Style>
  </Styles>
</Workbook>`

  return new Blob([excelXML], { type: 'application/vnd.ms-excel' })
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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