'use client'

interface ConfirmCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  taskName: string
  dueDate: string
}

export default function ConfirmCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  taskName,
  dueDate
}: ConfirmCompletionModalProps) {
  if (!isOpen) return null

  const isFutureDue = new Date(dueDate) > new Date()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Confirm Task Completion
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You're about to mark <strong>"{taskName}"</strong> as complete.
          </p>
          
          {isFutureDue && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This task is due on <strong>{new Date(dueDate).toLocaleDateString()}</strong>. 
                    Are you sure you want to mark it complete early?
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Yes, Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}