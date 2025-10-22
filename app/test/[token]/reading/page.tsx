'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'
import QuestionRenderer from '@/components/test/QuestionRenderer'
import IELTSQuestionRenderer from '@/components/test/IELTSQuestionRenderer'

interface Question {
  id: string
  type: 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN' | 'NOTES_COMPLETION' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'SUMMARY_COMPLETION'
  content: string
  options?: string[]
  part?: 1 | 2 | 3
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
  notesCompletionData?: {
    title: string
    instructions: string
    notes: Array<{
      id: string
      content: string
      hasBlank: boolean
      blankAnswer?: string
      blankPosition?: number
    }>
  }
  summaryCompletionData?: {
    title: string
    instructions: string
    content: string
    blanks: Array<{
      id: string
      position: number
      correctAnswer: string
      alternatives?: string[]
    }>
  }
  trueFalseNotGivenData?: {
    statement: string
    correctAnswer: 'TRUE' | 'FALSE' | 'NOT_GIVEN'
    explanation?: string
  }
  instructions?: string
  correctAnswer: string | string[] | Record<string, string>
  points: number
}

interface PartContent {
  part1: string
  part2: string
  part3: string
}

interface ReadingData {
  module: {
    id: string
    type: string
    duration: number
    instructions: string | null
  }
  questions: Question[]
  partContent?: PartContent
  assignment: {
    id: string
    candidateNumber: string
    studentName: string
    mockTitle: string
  }
}

export default function ReadingModule({ params }: { params: Promise<{ token: string }> }) {
  const [readingData, setReadingData] = useState<ReadingData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(60) // Percentage
  const [isResizing, setIsResizing] = useState(false)
  const [currentPart, setCurrentPart] = useState(1) // Track current part (1, 2, or 3)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/student/test-data?token=${encodeURIComponent(resolvedParams.token)}&module=READING`)
        const data = await response.json()

        if (response.ok) {
          setReadingData(data)
          setTimeRemaining(data.module.duration * 60) // Convert minutes to seconds
        } else {
          console.error('Failed to fetch test data:', data.error)
        }
      } catch (error) {
        console.error('Error fetching test data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [params])

  useEffect(() => {
    if (timeRemaining <= 0 && !submitted) {
      handleSubmit()
    }
  }, [timeRemaining, submitted])

  const handleAnswerChange = (questionId: string, answer: string | Record<string, string>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handlePartChange = (part: number) => {
    setCurrentPart(part)
  }

  const getCurrentPartContent = () => {
    if (!readingData?.partContent) return ''
    
    switch (currentPart) {
      case 1:
        return readingData.partContent.part1
      case 2:
        return readingData.partContent.part2
      case 3:
        return readingData.partContent.part3
      default:
        return readingData.partContent.part1
    }
  }

  const getCurrentPartQuestions = () => {
    if (!readingData?.questions) return []
    return readingData.questions.filter(q => q.part === currentPart)
  }

  const getPartDescription = (part: number) => {
    switch (part) {
      case 1:
        return 'typically contains factual information and details'
      case 2:
        return 'usually focuses on descriptive or narrative texts'
      case 3:
        return 'often contains argumentative or analytical texts'
      default:
        return 'contains various types of reading material'
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
    
    // Constrain between 30% and 70%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 70)
    setLeftPanelWidth(constrainedWidth)
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const handleSubmit = async () => {
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const resolvedParams = await params
      const response = await fetch(`/api/student/submissions/reading/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          answers,
          timeSpent: 60 * 60 - timeRemaining
        }),
      })

      if (response.ok) {
        router.push(`/test/${resolvedParams.token}/complete`)
      } else {
        console.error('Failed to submit reading answers')
      }
    } catch (error) {
      console.error('Error submitting answers:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!readingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Test</h2>
          <p className="mt-2 text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <FullscreenGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">IELTS</div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Candidate:</span> {readingData.assignment.candidateNumber}
              </div>
              <Timer 
                timeRemaining={timeRemaining}
                onTimeUp={() => handleSubmit()}
              />
            </div>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height Layout */}
      <div ref={containerRef} className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Reading Passage */}
        <div 
          className="bg-white border-r border-gray-200 overflow-y-auto"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Part {currentPart} Reading Passage</h2>
            
            {/* Instructions Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Read the passage below carefully</li>
                <li>• Answer the questions on the right based on the information in the passage</li>
                <li>• You can refer back to the passage while answering questions</li>
                <li>• Choose the best answer for each question</li>
                <li>• This is Part {currentPart} - {getPartDescription(currentPart)}</li>
              </ul>
            </div>
            {/* Part Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-800">Reading Passage</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((part) => (
                    <button
                      key={part}
                      onClick={() => handlePartChange(part)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        currentPart === part
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Part {part}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current Part Content */}
              <div className="text-sm leading-relaxed text-gray-700">
                {getCurrentPartContent() ? (
                  <div dangerouslySetInnerHTML={{ __html: getCurrentPartContent() }} />
                ) : (
                  <div className="text-gray-500 italic">
                    No reading passage content available for Part {currentPart}. Please contact your instructor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-0.5 h-8 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        {/* Right Panel - Answer Sheet */}
        <div 
          className="bg-gray-50 border-l border-gray-200 overflow-y-auto"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Part {currentPart} - Answer Sheet</h2>
              <div className="text-sm text-gray-600">
                {getCurrentPartQuestions().length} Question{getCurrentPartQuestions().length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {/* Question Count Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {getCurrentPartQuestions().length} Question{getCurrentPartQuestions().length !== 1 ? 's' : ''} in Part {currentPart}
              </div>
            </div>
            
            {/* Current Part Questions */}
            {getCurrentPartQuestions().map((question, index) => {
              // Use IELTS renderer for IELTS question types
              const isIELTSQuestion = ['NOTES_COMPLETION', 'MULTIPLE_CHOICE', 'TRUE_FALSE_NOT_GIVEN', 'SUMMARY_COMPLETION'].includes(question.type)
              
              if (isIELTSQuestion) {
                return (
                  <IELTSQuestionRenderer
                    key={question.id}
                    question={question as any}
                    questionNumber={index + 1}
                    onAnswerChange={handleAnswerChange}
                    initialAnswer={answers[question.id]}
                    disabled={submitted}
                    showInstructions={true}
                  />
                )
              }
              
              return (
                <QuestionRenderer
                  key={question.id}
                  question={question as any}
                  questionNumber={index + 1}
                  onAnswerChange={handleAnswerChange}
                  initialAnswer={answers[question.id]}
                  disabled={submitted}
                  showInstructions={true}
                />
              )
            })}
            
            {/* No Questions Message */}
            {getCurrentPartQuestions().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No questions available for Part {currentPart}</p>
                <p className="text-sm mt-2">Switch to another part to see questions</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? 'Submitting...' : 'Submit & Complete Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </FullscreenGuard>
  )
}
