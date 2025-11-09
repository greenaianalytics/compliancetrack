export interface CustomCategory {
  id: string
  sme_id: string
  category_name: string
  created_at: string
  updated_at: string
}

export interface CustomTask {
  id: string
  sme_id: string
  category_id?: string
  task_name: string
  description?: string
  due_date: string
  task_type: 'one_time' | 'repeatable'
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    end_date?: string
  }
  original_task_id?: string
  status: 'pending' | 'completed'
  completed_at?: string
  created_at: string
  updated_at: string
  category?: CustomCategory
}

export interface CreateCustomTaskData {
  task_name: string
  description?: string
  due_date: string
  category_id?: string
  task_type: 'one_time' | 'repeatable'
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    end_date?: string
  }
}

export interface CreateCustomCategoryData {
  category_name: string
}