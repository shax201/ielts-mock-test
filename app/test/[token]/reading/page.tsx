'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'
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
    // <FullscreenGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reading Module</h1>
              <p className="text-gray-600">Time: 60 minutes</p>
            </div>
            <Timer 
              timeRemaining={timeRemaining}
              onTimeUp={() => handleSubmit()}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h2>
          <p className="text-blue-800">{readingData.module.instructions || 'You will read three passages and answer questions. You should spend about 20 minutes on each passage.'}</p>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Questions</h2>
          
          <div className="space-y-8">
            {readingData.questions.map((question, index) => {
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
                    partContent={readingData.partContent}
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
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? 'Submitting...' : 'Submit & Complete Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
    // </FullscreenGuard>
  )
}
