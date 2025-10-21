'use client'

import { useState } from 'react'

interface SummaryBlank {
  id: string
  position: number
  correctAnswer: string
  alternatives?: string[]
}

interface SummaryCompletionData {
  title: string
  instructions: string
  content: string
  blanks: SummaryBlank[]
}

interface SummaryCompletionEditorProps {
  data: SummaryCompletionData
  onChange: (data: SummaryCompletionData) => void
}

export default function SummaryCompletionEditor({ data, onChange }: SummaryCompletionEditorProps) {
  const [localData, setLocalData] = useState<SummaryCompletionData>(data)

  const updateData = (updates: Partial<SummaryCompletionData>) => {
    const newData = { ...localData, ...updates }
    setLocalData(newData)
    onChange(newData)
  }

  const addBlank = () => {
    const newBlank: SummaryBlank = {
      id: `blank-${Date.now()}`,
      position: localData.blanks.length,
      correctAnswer: ''
    }
    updateData({
      blanks: [...localData.blanks, newBlank]
    })
  }

  const updateBlank = (id: string, updates: Partial<SummaryBlank>) => {
    const updatedBlanks = localData.blanks.map(blank => 
      blank.id === id ? { ...blank, ...updates } : blank
    )
    updateData({ blanks: updatedBlanks })
  }

  const deleteBlank = (id: string) => {
    const updatedBlanks = localData.blanks.filter(blank => blank.id !== id)
    updateData({ blanks: updatedBlanks })
  }

  const insertBlankInText = (blankId: string) => {
    const blank = localData.blanks.find(b => b.id === blankId)
    if (blank) {
      const blankMarker = `[${blank.position + 1}]`
      const newContent = localData.content + ` ${blankMarker}`
      updateData({ content: newContent })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary Title
        </label>
        <input
          type="text"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={localData.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="e.g., MARINE FOOD CHAIN"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          rows={2}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={localData.instructions}
          onChange={(e) => updateData({ instructions: e.target.value })}
          placeholder="e.g., Complete the summary. Write ONE WORD ONLY from the text in each gap."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary Content
        </label>
        <textarea
          rows={8}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={localData.content}
          onChange={(e) => updateData({ content: e.target.value })}
          placeholder="Enter the summary text. Use [1], [2], [3] etc. to mark where blanks should be placed..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Use [1], [2], [3] etc. in your text to mark where blanks should be placed.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Blanks Configuration
          </label>
          <button
            type="button"
            onClick={addBlank}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Blank
          </button>
        </div>

        <div className="space-y-3">
          {localData.blanks.map((blank, index) => (
            <div key={blank.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Blank {index + 1}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => insertBlankInText(blank.id)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Insert in Text
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBlank(blank.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={blank.correctAnswer}
                    onChange={(e) => updateBlank(blank.id, { correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Answers (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={blank.alternatives?.join(', ') || ''}
                    onChange={(e) => updateBlank(blank.id, { 
                      alternatives: e.target.value.split(',').map(alt => alt.trim()).filter(alt => alt)
                    })}
                    placeholder="Enter alternative answers separated by commas"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple alternatives with commas
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {localData.blanks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No blanks configured yet. Click "Add Blank" to get started.</p>
        </div>
      )}

      {/* Preview */}
      {localData.content && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-center mb-4 uppercase tracking-wide">
              {localData.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{localData.instructions}</p>
            <div className="text-sm leading-relaxed">
              {localData.content.split(/(\[\d+\])/).map((part, index) => {
                const blankMatch = part.match(/\[(\d+)\]/)
                if (blankMatch) {
                  const blankNumber = parseInt(blankMatch[1])
                  const blank = localData.blanks.find(b => b.position === blankNumber - 1)
                  return (
                    <span key={index} className="inline-block">
                      <input
                        type="text"
                        className="w-16 h-6 border border-gray-300 rounded px-1 text-xs mx-1"
                        placeholder={`${blankNumber}`}
                        disabled
                      />
                    </span>
                  )
                }
                return part
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
