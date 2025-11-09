'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface CustomTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
  smeId: string
}

interface CustomCategory {
  id: string
  category_name: string
}

export default function CustomTaskModal({ isOpen, onClose, onTaskCreated, smeId }: CustomTaskModalProps) {
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<CustomCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('sme_id', smeId)
      .order('category_name')

    if (data) {
      setCategories(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()
      
      let finalCategoryId = categoryId
      
      // Create new category if needed
      if (showNewCategory && newCategoryName.trim()) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('custom_categories')
          .insert({
            sme_id: smeId,
            category_name: newCategoryName.trim()
          })
          .select()
          .single()

        if (categoryError) throw categoryError
        finalCategoryId = newCategory.id
      }

      // Create the task
      const { error: taskError } = await supabase
        .from('custom_tasks')
        .insert({
          sme_id: smeId,
          category_id: finalCategoryId || null,
          task_name: taskName.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          status: 'pending'
        })

      if (taskError) throw taskError

      // Reset form and close modal
      resetForm()
      onTaskCreated()
      onClose()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTaskName('')
    setDescription('')
    setDueDate('')
    setCategoryId('')
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create Custom Task
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name *
              </label>
              <input
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              {!showNewCategory ? (
                <div className="space-y-2">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    + Create New Category
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new category name"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="mt-1 text-sm text-gray-600 hover:text-gray-500"
                  >
                    ← Choose existing category
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}