'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioPlayer from '@/components/test/AudioPlayer'
import Timer from '@/components/test/Timer'
import FillInTheBlankQuestion from '@/components/test/FillInTheBlankQuestion'
import FullscreenGuard from '@/components/test/FullscreenGuard'

interface Question {
  id: string
  type: 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN' | 'NOTES_COMPLETION' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'SUMMARY_COMPLETION'
  content: string
  options?: string[]
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

interface Module {
  id: string
  type: string
  duration: number
  audioUrl?: string
  instructions: string
}

interface Assignment {
  id: string
  candidateNumber: string
  studentName: string
  mockTitle: string
}

export default function ListeningPage({ params }: { params: Promise<{ token: string }> }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [module, setModule] = useState<Module | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/student/test-data?token=${encodeURIComponent(resolvedParams.token)}&module=LISTENING`)
        const data = await response.json()

        if (response.ok) {
          setQuestions(data.questions || [])
          setModule(data.module)
          setAssignment(data.assignment)
          setTimeRemaining(data.module.duration * 60) // Convert minutes to seconds
        } else {
          setError(data.error || 'Failed to load test data')
        }
      } catch (error) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [params])

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleAnswerChange = (questionId: string, answer: string | Record<string, string>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitted) return

    setIsSubmitted(true)
    
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/student/submissions/listening/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          answers,
          timeSpent: module?.duration ? (module.duration * 60) - timeRemaining : 0
        })
      })

      if (response.ok) {
        router.push(`/test/${resolvedParams.token}/reading`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit answers')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/test')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Test Entry
          </button>
        </div>
      </div>
    )
  }

  return (
    <FullscreenGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">IELTS Listening Test</h1>
                <div className="text-sm text-gray-500">
                  Candidate: {assignment?.candidateNumber}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Timer 
                  timeRemaining={timeRemaining}
                  onTimeUp={() => handleSubmit()}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitted}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  Submit Test
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p>{module?.instructions}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You will hear a number of different recordings</li>
                <li>You will have to answer questions on what you hear</li>
                <li>The audio will play automatically and cannot be paused or replayed</li>
                <li>You will have 10 minutes at the end to transfer your answers</li>
              </ul>
            </div>
          </div>

          {/* Audio Player */}
          {module?.audioUrl && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio</h2>
              <AudioPlayer src={module.audioUrl} />
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  
                  <div className="flex-1">
                    {question.type === 'FIB' && question.fibData ? (
                      <FillInTheBlankQuestion
                        data={question.fibData}
                        onAnswerChange={(fibAnswers) => {
                          handleAnswerChange(question.id, fibAnswers)
                        }}
                        initialAnswers={typeof answers[question.id] === 'object' ? answers[question.id] as Record<string, string> : {}}
                        disabled={isSubmitted}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="prose max-w-none">
                          <p className="text-gray-900 mb-4">{question.content}</p>
                        </div>
                        <p className="text-red-600 text-sm">
                          Error: Unsupported question type "{question.type}".
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FullscreenGuard>
  )
}