'use client'

<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react'
import FillInTheBlankQuestion from './FillInTheBlankQuestion'
import TrueFalseQuestion from './TrueFalseQuestion'
import MultipleChoiceQuestion from './MultipleChoiceQuestion'
import MatchingQuestion from './MatchingQuestion'
>>>>>>> main

interface Question {
  id: string
  type: 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN'
  content: string
  options?: string[]
<<<<<<< HEAD
  correctAnswer: string | string[] | Record<string, string>
  points: number
  fibData?: FillInTheBlankData
  matchingData?: MatchingData
  instructions?: string
=======
  fibData?: {
    content: string
    blanks: Array<{
      id: string
      position: number
      correctAnswer: string
      alternatives?: string[]
      caseSensitive: boolean
    }>
    instructions: string
  }
  matchingData?: {
    leftItems: Array<{
      id: string
      label: string
      content: string
    }>
    rightItems: Array<{
      id: string
      label: string
      content: string
    }>
  }
  instructions?: string
  correctAnswer: string | string[] | Record<string, string>
  points: number
>>>>>>> main
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
<<<<<<< HEAD
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
=======
  const [currentAnswer, setCurrentAnswer] = useState<string | Record<string, string>>(
    initialAnswer || (question.type === 'FIB' ? {} : '')
  )

  useEffect(() => {
    setCurrentAnswer(initialAnswer || (question.type === 'FIB' ? {} : ''))
  }, [initialAnswer, question.type])

  const handleAnswerChange = (answer: string | Record<string, string>) => {
    setCurrentAnswer(answer)
    onAnswerChange(question.id, answer)
  }

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'FIB':
        if (question.fibData) {
          return (
            <FillInTheBlankQuestion
              data={question.fibData}
              onAnswerChange={(fibAnswers) => {
                handleAnswerChange(fibAnswers)
              }}
              initialAnswers={typeof currentAnswer === 'object' ? currentAnswer : {}}
              disabled={disabled}
            />
          )
        } else {
          // Simple fill-in-the-blank without structured data
          return (
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-900 mb-4">{question.content}</p>
              </div>
              <input
                type="text"
                value={typeof currentAnswer === 'string' ? currentAnswer : ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                disabled={disabled}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your answer..."
              />
            </div>
          )
        }

      case 'TRUE_FALSE':
        return (
          <TrueFalseQuestion
            question={question.content}
            onAnswerChange={(answer) => handleAnswerChange(answer)}
            initialAnswer={typeof currentAnswer === 'string' ? currentAnswer : ''}
            disabled={disabled}
            includeNotGiven={false}
          />
        )

      case 'NOT_GIVEN':
        return (
          <TrueFalseQuestion
            question={question.content}
            onAnswerChange={(answer) => handleAnswerChange(answer)}
            initialAnswer={typeof currentAnswer === 'string' ? currentAnswer : ''}
            disabled={disabled}
            includeNotGiven={true}
          />
        )

      case 'MCQ':
        return (
          <MultipleChoiceQuestion
            question={question.content}
            options={question.options || []}
            onAnswerChange={(answer) => handleAnswerChange(answer)}
            initialAnswer={typeof currentAnswer === 'string' ? currentAnswer : ''}
            disabled={disabled}
            allowMultiple={false}
          />
        )

      case 'MATCHING':
        if (question.matchingData) {
          return (
            <MatchingQuestion
              question={question.content}
              leftItems={question.matchingData.leftItems}
              rightItems={question.matchingData.rightItems}
              onAnswerChange={(answers) => handleAnswerChange(answers)}
              initialAnswers={typeof currentAnswer === 'object' ? currentAnswer : {}}
              disabled={disabled}
              instructions={question.instructions}
            />
          )
        } else {
          return (
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-900 mb-4">{question.content}</p>
                <p className="text-red-600 text-sm">
                  Error: Matching question data not found.
                </p>
              </div>
            </div>
          )
        }

      default:
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-900 mb-4">{question.content}</p>
              <p className="text-red-600 text-sm">
                Error: Unknown question type "{question.type}".
              </p>
            </div>
>>>>>>> main
          </div>
        )
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start space-x-4">
        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
          {questionNumber}
        </span>
        
        <div className="flex-1">
          {showInstructions && question.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium">
                {question.instructions}
              </p>
            </div>
          )}
          
          {renderQuestionContent()}
        </div>
      </div>
    </div>
  )
}

// Helper function to get question type display name
export function getQuestionTypeDisplayName(type: string): string {
  switch (type) {
    case 'MCQ':
      return 'Multiple Choice'
    case 'FIB':
      return 'Fill in the Blank'
    case 'MATCHING':
      return 'Matching'
    case 'TRUE_FALSE':
      return 'True/False'
    case 'NOT_GIVEN':
      return 'True/False/Not Given'
    default:
      return 'Unknown'
  }
}

// Helper function to validate question answers
export function validateQuestionAnswer(
  question: Question,
  userAnswer: string | Record<string, string>
): { correct: boolean; score: number; maxScore: number; feedback: string } {
  const maxScore = question.points || 1
  
  switch (question.type) {
    case 'FIB':
      if (question.fibData) {
        const fibAnswers = typeof userAnswer === 'object' ? userAnswer : {}
        const validation = validateFillInTheBlankAnswers(question.fibData, fibAnswers)
        return {
          correct: validation.score === validation.total,
          score: validation.score,
          maxScore: validation.total,
          feedback: `Score: ${validation.score}/${validation.total}`
        }
      }
      return {
        correct: userAnswer === question.correctAnswer,
        score: userAnswer === question.correctAnswer ? maxScore : 0,
        maxScore,
        feedback: userAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect'
      }

    case 'TRUE_FALSE':
    case 'NOT_GIVEN':
      const tfValidation = validateTrueFalseAnswer(
        typeof userAnswer === 'string' ? userAnswer : '',
        typeof question.correctAnswer === 'string' ? question.correctAnswer : ''
      )
      return {
        correct: tfValidation.correct,
        score: tfValidation.correct ? maxScore : 0,
        maxScore,
        feedback: tfValidation.message
      }

    case 'MCQ':
      const mcqValidation = validateMultipleChoiceAnswer(
        typeof userAnswer === 'string' ? userAnswer : '',
        Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer as string],
        false
      )
      return {
        correct: mcqValidation.correct,
        score: mcqValidation.correct ? maxScore : 0,
        maxScore,
        feedback: mcqValidation.message
      }

    case 'MATCHING':
      if (question.matchingData) {
        const matchingAnswers = typeof userAnswer === 'object' && !Array.isArray(userAnswer) ? userAnswer : {}
        const correctAnswers = typeof question.correctAnswer === 'object' && !Array.isArray(question.correctAnswer) ? question.correctAnswer : {}
        const validation = validateMatchingAnswers(matchingAnswers as Record<string, string>, correctAnswers as Record<string, string>)
        return {
          correct: validation.score === validation.total,
          score: validation.score,
          maxScore: validation.total,
          feedback: `Score: ${validation.score}/${validation.total}`
        }
      }
      return {
        correct: false,
        score: 0,
        maxScore,
        feedback: 'Error: Matching data not found'
      }

    default:
      return {
        correct: false,
        score: 0,
        maxScore,
        feedback: 'Unknown question type'
      }
  }
}

// Import validation functions
import { validateFillInTheBlankAnswers } from './FillInTheBlankQuestion'
import { validateTrueFalseAnswer } from './TrueFalseQuestion'
import { validateMultipleChoiceAnswer } from './MultipleChoiceQuestion'
import { validateMatchingAnswers } from './MatchingQuestion'
>>>>>>> main
