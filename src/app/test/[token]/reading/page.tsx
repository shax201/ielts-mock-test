'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'
import IELTSQuestionRenderer from '@/components/test/IELTSQuestionRenderer'

interface Question {
  id: string
  type: 'NOTES_COMPLETION' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'TRUE_FALSE' | 'SUMMARY_COMPLETION' | 'FIB' | 'MATCHING'
  content: string
  options?: string[]
  part: 1 | 2 | 3
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
  instructions: string
}

interface Assignment {
  id: string
  candidateNumber: string
  studentName: string
  mockTitle: string
}

interface PartContent {
  part1: string
  part2: string
  part3: string
}

export default function ReadingPage({ params }: { params: Promise<{ token: string }> }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [module, setModule] = useState<Module | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [partContent, setPartContent] = useState<PartContent | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/student/test-data?token=${encodeURIComponent(resolvedParams.token)}&module=READING`)
        const data = await response.json()

        if (response.ok) {
          setQuestions(data.questions || [])
          setModule(data.module)
          setAssignment(data.assignment)
          setPartContent(data.partContent)
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
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/student/submissions/reading/submit`, {
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
        router.push(`/test/${resolvedParams.token}/writing`)
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
                <h1 className="text-xl font-semibold text-gray-900">IELTS Reading Test</h1>
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
                  disabled={submitted}
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
                <li>You will read three passages and answer questions</li>
                <li>You should spend about 20 minutes on each passage</li>
                <li>Answer all questions in the time allowed</li>
              </ul>
            </div>
          </div>

          {/* Reading Passages and Questions */}
          <div className="space-y-8">
            {[1, 2, 3].map(part => {
              const partQuestions = questions.filter(q => (q.part || 1) === part)
              const partText = partContent ? 
                (part === 1 ? partContent.part1 : part === 2 ? partContent.part2 : partContent.part3) : 
                ''

              return (
                <div key={part} className="bg-white shadow rounded-lg">
                  {/* Part Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Part {part}</h2>
                  </div>

                  <div className="p-6">
                    {/* Reading Passage */}
                    {partText && (
                      <div className="mb-8">
                        <h3 className="text-md font-semibold text-gray-900 mb-4">Reading Passage {part}</h3>
                        <div 
                          className="prose max-w-none text-sm leading-relaxed text-gray-800"
                          dangerouslySetInnerHTML={{ __html: partText }}
                        />
                      </div>
                    )}

                    {/* Questions */}
                    <div className="space-y-6">
                      {partQuestions.map((question, index) => (
                        <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <IELTSQuestionRenderer
                            question={question}
                            questionNumber={index + 1}
                            onAnswerChange={handleAnswerChange}
                            initialAnswer={answers[question.id]}
                            disabled={submitted}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </FullscreenGuard>
  )
}