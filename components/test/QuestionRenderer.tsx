'use client'

import { useState } from 'react'

interface BlankField {
  id: string
  position: number
  correctAnswer: string
  alternatives?: string[]
  caseSensitive: boolean
}

interface FillInTheBlankData {
  content: string
  blanks: BlankField[]
  instructions: string
}

interface MatchingItem {
  id: string
  label: string
  content: string
}

interface MatchingData {
  leftItems: MatchingItem[]
  rightItems: MatchingItem[]
}

interface Question {
  id: string
  type: 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN'
  content: string
  options?: string[]
  correctAnswer: string | string[] | Record<string, string>
  points: number
  fibData?: FillInTheBlankData
  matchingData?: MatchingData
  instructions?: string
}

interface QuestionRendererProps {
  question: Question
  questionNumber: number
  onAnswerChange: (questionId: string, answer: string | Record<string, string>) => void
  initialAnswer?: string | Record<string, string>
  disabled?: boolean
  showInstructions?: boolean
}

export default function QuestionRenderer({
  question,
  questionNumber,
  onAnswerChange,
  initialAnswer,
  disabled = false,
  showInstructions = true
}: QuestionRendererProps) {
  const [localAnswer, setLocalAnswer] = useState<string | Record<string, string>>(initialAnswer || '')

  const handleAnswerChange = (answer: string | Record<string, string>) => {
    setLocalAnswer(answer)
    onAnswerChange(question.id, answer)
  }

  const renderMultipleChoice = () => {
    return (
      <div className="space-y-4">
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">Choose the correct answer.</p>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm mb-4">
            {question.content}
          </div>
          
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={localAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderTrueFalse = () => {
    return (
      <div className="space-y-4">
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">Choose the correct answer.</p>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm mb-4">
            {question.content}
          </div>
          
          <div className="space-y-2">
            {(['TRUE', 'FALSE'] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={localAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderTrueFalseNotGiven = () => {
    return (
      <div className="space-y-4">
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">Choose the correct answer.</p>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm mb-4">
            {question.content}
          </div>
          
          <div className="space-y-2">
            {(['TRUE', 'FALSE', 'NOT_GIVEN'] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={localAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderFillInTheBlank = () => {
    if (!question.fibData) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">FIB question data not available.</p>
        </div>
      )
    }

    const { content, blanks, instructions } = question.fibData
    const answers = typeof localAnswer === 'object' ? localAnswer : {}

    const handleBlankChange = (blankId: string, value: string) => {
      const newAnswers = { ...answers, [blankId]: value }
      handleAnswerChange(newAnswers)
    }

    const renderContentWithBlanks = () => {
      let renderedContent = content
      blanks.forEach((blank, index) => {
        const placeholder = `[BLANK_${blank.position}]`
        renderedContent = renderedContent.replace(placeholder, placeholder)
      })
      return renderedContent
    }

    return (
      <div className="space-y-4">
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium">{instructions}</p>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm mb-6 font-medium text-gray-900">
            {question.content}
          </div>
          
          <div className="text-sm leading-relaxed text-gray-800">
            {renderContentWithBlanks().split(/(\[BLANK_\d+\])/).map((part, index) => {
              const blankMatch = part.match(/\[BLANK_(\d+)\]/)
              if (blankMatch) {
                const blankNumber = parseInt(blankMatch[1])
                const blank = blanks.find(b => b.position === blankNumber)
                if (blank) {
                  return (
                    <span key={index} className="inline-block mx-1">
                      <input
                        type="text"
                        value={answers[blank.id] || ''}
                        onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                        disabled={disabled}
                        className="inline-block w-32 h-8 border-2 border-dashed border-gray-400 rounded-md px-3 py-1 text-sm font-medium text-center bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-500"
                        placeholder={`Answer ${blankNumber}`}
                        style={{
                          minWidth: '120px',
                          maxWidth: '200px'
                        }}
                      />
                    </span>
                  )
                }
              }
              return <span key={index}>{part}</span>
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderMatching = () => {
    return (
      <div className="space-y-4">
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">Match the items on the left with the items on the right.</p>
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm mb-4">
            {question.content}
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Column A</h4>
              <div className="space-y-2">
                {question.options?.slice(0, Math.ceil(question.options.length / 2)).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Column B</h4>
              <div className="space-y-2">
                {question.options?.slice(Math.ceil(question.options.length / 2)).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{index + 1}</span>
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'MCQ':
        return renderMultipleChoice()
      case 'TRUE_FALSE':
        return renderTrueFalse()
      case 'NOT_GIVEN':
        return renderTrueFalseNotGiven()
      case 'FIB':
        return renderFillInTheBlank()
      case 'MATCHING':
        return renderMatching()
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Unsupported question type: {question.type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Question {questionNumber}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{question.points} points</span>
        </div>
      </div>
      
      {renderQuestion()}
    </div>
  )
}
