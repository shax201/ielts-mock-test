'use client'

import { useState } from 'react'
import AdvancedTextEditor from './AdvancedTextEditor'

interface TrueFalseNotGivenEditorProps {
  statement: string
  correctAnswer: 'TRUE' | 'FALSE' | 'NOT_GIVEN'
  explanation?: string
  onStatementChange: (statement: string) => void
  onCorrectAnswerChange: (answer: 'TRUE' | 'FALSE' | 'NOT_GIVEN') => void
  onExplanationChange: (explanation: string) => void
}

export default function TrueFalseNotGivenEditor({
  statement,
  correctAnswer,
  explanation,
  onStatementChange,
  onCorrectAnswerChange,
  onExplanationChange
}: TrueFalseNotGivenEditorProps) {
  const [activeTab, setActiveTab] = useState<'statement' | 'answer' | 'explanation'>('statement')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('statement')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'statement'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Statement
        </button>
        <button
          onClick={() => setActiveTab('answer')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'answer'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Correct Answer
        </button>
        <button
          onClick={() => setActiveTab('explanation')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'explanation'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Explanation
        </button>
      </div>

      {/* Statement Editor */}
      {activeTab === 'statement' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statement
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Write a clear statement that can be evaluated as TRUE, FALSE, or NOT GIVEN based on the reading passage.
              </p>
            </div>
            <AdvancedTextEditor
              data={statement}
              onChange={onStatementChange}
              placeholder="Enter the statement to be evaluated..."
            />
          </div>
        </div>
      )}

      {/* Correct Answer Editor */}
      {activeTab === 'answer' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <div className="space-y-3">
              {(['TRUE', 'FALSE', 'NOT_GIVEN'] as const).map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={option}
                    checked={correctAnswer === option}
                    onChange={(e) => onCorrectAnswerChange(e.target.value as 'TRUE' | 'FALSE' | 'NOT_GIVEN')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Answer Guidelines:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>TRUE:</strong> The statement agrees with the information in the passage</li>
              <li>• <strong>FALSE:</strong> The statement contradicts the information in the passage</li>
              <li>• <strong>NOT GIVEN:</strong> The information is not mentioned in the passage</li>
            </ul>
          </div>
        </div>
      )}

      {/* Explanation Editor */}
      {activeTab === 'explanation' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                Provide an explanation for why this is the correct answer. This will help with grading and feedback.
              </p>
            </div>
            <AdvancedTextEditor
              data={explanation || ''}
              onChange={onExplanationChange}
              placeholder="Enter explanation for the correct answer..."
            />
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm mb-4">
            <strong>Statement:</strong> {statement || 'No statement provided'}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Choose the correct answer:</div>
            {(['TRUE', 'FALSE', 'NOT_GIVEN'] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="preview-answer"
                  value={option}
                  checked={correctAnswer === option}
                  disabled
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
                {correctAnswer === option && (
                  <span className="ml-2 text-xs text-green-600 font-medium">(Correct)</span>
                )}
              </label>
            ))}
          </div>

          {explanation && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Explanation:</div>
              <div className="text-sm text-gray-600">{explanation}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
