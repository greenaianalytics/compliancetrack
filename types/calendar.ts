export interface CalendarTask {
  id: string
  task_name: string
  description?: string
  due_date: string
  status: 'pending' | 'completed' | 'hidden'
  category: string
  priority: 'high' | 'medium' | 'low'
  is_custom: boolean
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  tasks: CalendarTask[]
}

export interface CalendarView {
  month: number
  year: number
  weeks: CalendarDay[][]
}