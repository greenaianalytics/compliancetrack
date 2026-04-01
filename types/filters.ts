export interface TaskFilters {
  category: string
  status: string
  priority: string
  taskType: string // 'all' | 'compliance' | 'custom'
  search: string
  dueDate: string // 'all' | 'today' | 'week' | 'month' | 'overdue'
}

export const DEFAULT_FILTERS: TaskFilters = {
  category: 'all',
  status: 'all',
  priority: 'all',
  taskType: 'all',
  search: '',
  dueDate: 'all'
}