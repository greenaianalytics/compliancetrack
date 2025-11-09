import { createBrowserClient, createServerClient } from './supabase'
import { CreateCustomTaskData, CreateCustomCategoryData, CustomCategory, CustomTask } from '@/types/custom-tasks'

export const createCustomCategory = async (smeId: string, data: CreateCustomCategoryData): Promise<CustomCategory> => {
  const supabase = createBrowserClient()
  
  const { data: category, error } = await supabase
    .from('custom_categories')
    .insert([
      {
        sme_id: smeId,
        category_name: data.category_name,
      }
    ])
    .select()
    .single()

  if (error) throw error
  return category
}

export const getCustomCategories = async (smeId: string): Promise<CustomCategory[]> => {
  const supabase = createBrowserClient()
  
  const { data: categories, error } = await supabase
    .from('custom_categories')
    .select('*')
    .eq('sme_id', smeId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return categories || []
}

export const createCustomTask = async (smeId: string, data: CreateCustomTaskData): Promise<CustomTask> => {
  const supabase = createBrowserClient()
  
  const taskData = {
    sme_id: smeId,
    task_name: data.task_name,
    description: data.description,
    due_date: data.due_date,
    category_id: data.category_id,
    task_type: data.task_type,
    recurrence_pattern: data.recurrence_pattern,
    status: 'pending'
  }

  const { data: task, error } = await supabase
    .from('custom_tasks')
    .insert([taskData])
    .select(`
      *,
      category:custom_categories(*)
    `)
    .single()

  if (error) throw error
  return task
}

export const getCustomTasks = async (smeId: string): Promise<CustomTask[]> => {
  const supabase = createBrowserClient()
  
  const { data: tasks, error } = await supabase
    .from('custom_tasks')
    .select(`
      *,
      category:custom_categories(*)
    `)
    .eq('sme_id', smeId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return tasks || []
}

export const updateCustomTaskStatus = async (taskId: string, status: 'pending' | 'completed'): Promise<CustomTask> => {
  const supabase = createBrowserClient()
  
  const updateData: any = { status }
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  } else {
    updateData.completed_at = null
  }

  const { data: task, error } = await supabase
    .from('custom_tasks')
    .update(updateData)
    .eq('id', taskId)
    .select(`
      *,
      category:custom_categories(*)
    `)
    .single()

  if (error) throw error
  return task
}

export const deleteCustomTask = async (taskId: string): Promise<void> => {
  const supabase = createBrowserClient()
  
  const { error } = await supabase
    .from('custom_tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}

export const deleteCustomCategory = async (categoryId: string): Promise<void> => {
  const supabase = createBrowserClient()
  
  // First delete all tasks in this category
  await supabase
    .from('custom_tasks')
    .delete()
    .eq('category_id', categoryId)

  // Then delete the category
  const { error } = await supabase
    .from('custom_categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw error
}