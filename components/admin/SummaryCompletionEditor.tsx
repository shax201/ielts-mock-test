'use client'

import { useState } from 'react'
import AdvancedTextEditor from './AdvancedTextEditor'

interface BlankField {
  id: string
  position: number
  correctAnswer: string
  alternatives?: string[]
}

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
        </div>
      )}

      {/* Preview */}
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
    </div>
  )
}
