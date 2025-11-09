import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format task names from snake_case to Proper Case
export const formatTaskName = (taskName: string): string => {
  if (!taskName) return ''
  
  // Convert snake_case to space separated and capitalize each word
  return taskName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Format date for display
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Calculate health score
export const calculateHealthScore = (completed: number, total: number): number => {
  if (total === 0) return 100
  return Math.round((completed / total) * 100)
}

// Calculate days until due
export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get priority color
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'red'
    case 'medium': return 'yellow'
    case 'low': return 'green'
    default: return 'gray'
  }
}