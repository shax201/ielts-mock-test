'use client'

import { useState } from 'react'

interface TrueFalseNotGivenData {
  statement: string
  correctAnswer: 'TRUE' | 'FALSE' | 'NOT_GIVEN'
  explanation?: string
}

interface TrueFalseNotGivenEditorProps {
  data: TrueFalseNotGivenData
  onChange: (data: TrueFalseNotGivenData) => void
}

export default function TrueFalseNotGivenEditor({ data, onChange }: TrueFalseNotGivenEditorProps) {
  const [localData, setLocalData] = useState<TrueFalseNotGivenData>(data)

  const updateData = (updates: Partial<TrueFalseNotGivenData>) => {
    const newData = { ...localData, ...updates }
    setLocalData(newData)
    onChange(newData)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statement
        </label>
        <textarea
          rows={3}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={localData.statement}
          onChange={(e) => updateData({ statement: e.target.value })}
          placeholder="Enter the statement that students need to evaluate..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer
        </label>
        <div className="space-y-2">
          {(['TRUE', 'FALSE', 'NOT_GIVEN'] as const).map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="radio"
                name="correctAnswer"
                value={option}
                checked={localData.correctAnswer === option}
                onChange={(e) => updateData({ correctAnswer: e.target.value as 'TRUE' | 'FALSE' | 'NOT_GIVEN' })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          rows={3}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={localData.explanation || ''}
          onChange={(e) => updateData({ explanation: e.target.value })}
          placeholder="Explain why this is the correct answer (for instructor reference only)..."
        />
        <p className="mt-1 text-xs text-gray-500">
          This explanation is only visible to instructors, not students.
        </p>
      </div>

      {/* Preview */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-3">
            Choose the correct answer.
          </div>
          <div className="text-sm mb-4">
            {localData.statement || 'Statement will appear here...'}
          </div>
          <div className="space-y-2">
            {(['TRUE', 'FALSE', 'NOT_GIVEN'] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="preview"
                  disabled
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
