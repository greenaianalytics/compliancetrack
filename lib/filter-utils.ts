import { TaskFilters } from '@/types/filters'
import { Task } from '@/types/tasks'

export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter(task => {
    // Category filter
    if (filters.category !== 'all' && task.category !== filters.category) {
      return false
    }

    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false
    }

    // Task type filter (compliance vs custom)
    if (filters.taskType !== 'all') {
      if (filters.taskType === 'compliance' && task.is_custom) {
        return false
      }
      if (filters.taskType === 'custom' && !task.is_custom) {
        return false
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesName = task.task_name.toLowerCase().includes(searchLower)
      const matchesDescription = task.description?.toLowerCase().includes(searchLower) || false
      if (!matchesName && !matchesDescription) {
        return false
      }
    }

    // Due date filter
    if (filters.dueDate !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const taskDueDate = new Date(task.due_date)
      taskDueDate.setHours(0, 0, 0, 0)

      switch (filters.dueDate) {
        case 'today':
          if (taskDueDate.getTime() !== today.getTime()) return false
          break
        case 'week':
          const nextWeek = new Date(today)
          nextWeek.setDate(today.getDate() + 7)
          if (taskDueDate < today || taskDueDate > nextWeek) return false
          break
        case 'month':
          const nextMonth = new Date(today)
          nextMonth.setMonth(today.getMonth() + 1)
          if (taskDueDate < today || taskDueDate > nextMonth) return false
          break
        case 'overdue':
          if (taskDueDate >= today || task.status === 'completed') return false
          break
      }
    }

    return true
  })
}

export const getUniqueCategories = (tasks: Task[]): string[] => {
  const categories = tasks.map(task => task.category)
  return [...new Set(categories)].sort()
}

export const getFilterStats = (tasks: Task[], filteredTasks: Task[]) => {
  const totalTasks = tasks.length
  const visibleTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter(task => task.status === 'completed').length
  const customTasks = filteredTasks.filter(task => task.is_custom).length
  const complianceTasks = filteredTasks.filter(task => !task.is_custom).length

  return {
    totalTasks,
    visibleTasks,
    completedTasks,
    customTasks,
    complianceTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }
}