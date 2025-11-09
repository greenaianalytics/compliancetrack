import { CalendarDay, CalendarTask, CalendarView } from '@/types/calendar'

export const generateCalendar = (month: number, year: number, tasks: CalendarTask[]): CalendarView => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
  
  const weeks: CalendarDay[][] = []
  const currentDate = new Date(startDate)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  while (currentDate <= endDate) {
    if (weeks.length === 0 || currentDate.getDay() === 0) {
      weeks.push([])
    }

    const date = new Date(currentDate)
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    
    // Filter tasks for this specific day
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === date.getTime()
    })

    weeks[weeks.length - 1].push({
      date,
      isCurrentMonth,
      isToday,
      tasks: dayTasks
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    month,
    year,
    weeks
  }
}

export const getMonthName = (month: number): string => {
  return new Date(2000, month, 1).toLocaleString('default', { month: 'long' })
}

export const getWeekdayNames = (): string[] => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

export const navigateMonth = (currentMonth: number, currentYear: number, direction: 'prev' | 'next') => {
  let newMonth = currentMonth
  let newYear = currentYear

  if (direction === 'prev') {
    newMonth = currentMonth - 1
    if (newMonth < 0) {
      newMonth = 11
      newYear = currentYear - 1
    }
  } else {
    newMonth = currentMonth + 1
    if (newMonth > 11) {
      newMonth = 0
      newYear = currentYear + 1
    }
  }

  return { newMonth, newYear }
}

export const getTasksForDate = (tasks: CalendarTask[], date: Date): CalendarTask[] => {
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  return tasks.filter(task => {
    const taskDate = new Date(task.due_date)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === targetDate.getTime()
  })
}