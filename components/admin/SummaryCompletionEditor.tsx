'use client'

import { useState } from 'react'
<<<<<<< HEAD
import AdvancedTextEditor from './AdvancedTextEditor'

interface BlankField {
=======

interface SummaryBlank {
>>>>>>> main
  id: string
  position: number
  correctAnswer: string
  alternatives?: string[]
}

<<<<<<< HEAD
interface SummaryCompletionEditorProps {
  title: string
  instructions: string
  content: string
  blanks: BlankField[]
  onTitleChange: (title: string) => void
  onInstructionsChange: (instructions: string) => void
  onContentChange: (content: string) => void
  onBlanksChange: (blanks: BlankField[]) => void
}

export default function SummaryCompletionEditor({
  title,
  instructions,
  content,
  blanks,
  onTitleChange,
  onInstructionsChange,
  onContentChange,
  onBlanksChange
}: SummaryCompletionEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'blanks'>('content')

  const addBlank = () => {
    const newBlank: BlankField = {
      id: `blank-${Date.now()}`,
      position: blanks.length + 1,
      correctAnswer: '',
      alternatives: []
    }
    onBlanksChange([...blanks, newBlank])
  }

  const updateBlank = (id: string, updates: Partial<BlankField>) => {
    onBlanksChange(
      blanks.map(blank => 
        blank.id === id ? { ...blank, ...updates } : blank
      )
    )
  }

  const removeBlank = (id: string) => {
    onBlanksChange(blanks.filter(blank => blank.id !== id))
  }

  const addAlternative = (blankId: string) => {
    const blank = blanks.find(b => b.id === blankId)
    if (blank) {
      const newAlternatives = [...(blank.alternatives || []), '']
      updateBlank(blankId, { alternatives: newAlternatives })
    }
  }

  const updateAlternative = (blankId: string, index: number, value: string) => {
    const blank = blanks.find(b => b.id === blankId)
    if (blank) {
      const newAlternatives = [...(blank.alternatives || [])]
      newAlternatives[index] = value
      updateBlank(blankId, { alternatives: newAlternatives })
    }
  }

  const removeAlternative = (blankId: string, index: number) => {
    const blank = blanks.find(b => b.id === blankId)
    if (blank) {
      const newAlternatives = (blank.alternatives || []).filter((_, i) => i !== index)
      updateBlank(blankId, { alternatives: newAlternatives })
    }
  }

  const renderContentWithBlanks = () => {
    let renderedContent = content
    blanks.forEach((blank, index) => {
      const placeholder = `[${blank.position}]`
      renderedContent = renderedContent.replace(placeholder, placeholder)
    })
    return renderedContent
  }

  return (
    <div className="space-y-6">
      {/* Title and Instructions */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the title for the summary completion..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <AdvancedTextEditor
            data={instructions}
            onChange={onInstructionsChange}
            placeholder="Enter instructions for the summary completion..."
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'content'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('blanks')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'blanks'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Blanks ({blanks.length})
        </button>
      </div>

      {/* Content Editor */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Content
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Use [1], [2], [3], etc. to mark where blanks should appear in the text.
              </p>
            </div>
            <AdvancedTextEditor
              data={content}
              onChange={onContentChange}
              placeholder="Enter the summary content. Use [1], [2], [3] to mark blanks..."
            />
          </div>
        </div>
      )}

      {/* Blanks Editor */}
      {activeTab === 'blanks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Blanks</h3>
            <button
              onClick={addBlank}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Blank
            </button>
          </div>

          <div className="space-y-3">
            {blanks.map((blank, index) => (
              <div key={blank.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Blank {blank.position}
                    </span>
                    <span className="text-sm text-gray-500">Position {blank.position}</span>
                  </div>
                  <button
                    onClick={() => removeBlank(blank.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={blank.correctAnswer}
                      onChange={(e) => updateBlank(blank.id, { correctAnswer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the correct answer..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Alternative Answers (Optional)
                      </label>
                      <button
                        onClick={() => addAlternative(blank.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Alternative
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(blank.alternatives || []).map((alt, altIndex) => (
                        <div key={altIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={alt}
                            onChange={(e) => updateAlternative(blank.id, altIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter alternative answer..."
                          />
                          <button
                            onClick={() => removeAlternative(blank.id, altIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
=======
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
>>>>>>> main
        </div>
      )}

      {/* Preview */}
<<<<<<< HEAD
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-bold text-center mb-6 uppercase tracking-wide">
            {title || 'Untitled Summary'}
          </h4>
          
          <div className="text-sm leading-relaxed">
            {content.split(/(\[\d+\])/).map((part, index) => {
              const blankMatch = part.match(/\[(\d+)\]/)
              if (blankMatch) {
                const blankNumber = parseInt(blankMatch[1])
                const blank = blanks.find(b => b.position === blankNumber)
                return (
                  <span key={index} className="inline-block">
                    <input
                      type="text"
                      disabled
                      className="w-16 h-6 border border-gray-300 rounded px-1 text-xs mx-1 bg-gray-100"
                      placeholder={`${blankNumber}`}
                    />
                  </span>
                )
              }
              return part
            })}
          </div>
        </div>
      </div>
=======
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
>>>>>>> main
    </div>
  )
}
