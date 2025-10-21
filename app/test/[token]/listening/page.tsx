'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioPlayer from '@/components/test/AudioPlayer'
import Timer from '@/components/test/Timer'
import FillInTheBlankQuestion from '@/components/test/FillInTheBlankQuestion'
import FullscreenGuard from '@/components/test/FullscreenGuard'

interface Question {
  id: string
  type: 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN'
  content: string
  options?: string[]
  fibData?: any
  instructions?: string
  correctAnswer: string | string[]
  points: number
}

interface ListeningData {
  module: {
    id: string
    type: string
    duration: number
    audioUrl: string | null
    instructions: string | null
  }
  questions: Question[]
  assignment: {
    id: string
    candidateNumber: string
    studentName: string
    mockTitle: string
  }
}

export default function ListeningModule({ params }: { params: Promise<{ token: string }> }) {
  const [listeningData, setListeningData] = useState<ListeningData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(40 * 60) // 40 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/student/test-data?token=${encodeURIComponent(resolvedParams.token)}&module=LISTENING`)
        const data = await response.json()

        if (response.ok) {
          setListeningData(data)
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

  const handleAnswerChange = (questionId: string, answer: string) => {
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
      const response = await fetch(`/api/student/submissions/listening/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          answers,
          timeSpent: 40 * 60 - timeRemaining
        }),
      })

      if (response.ok) {
        router.push(`/test/${resolvedParams.token}/reading`)
      } else {
        console.error('Failed to submit listening answers')
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

  if (!listeningData) {
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Listening Module</h1>
              <p className="text-gray-600">Time: 40 minutes</p>
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
          <p className="text-blue-800">{listeningData.module.instructions || 'You will hear a number of different recordings and you will have to answer questions on what you hear.'}</p>
        </div>

        {/* Audio Player */}
        {listeningData.module.audioUrl && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio</h2>
            <AudioPlayer 
              src={listeningData.module.audioUrl}
              onEnded={() => {
                // Audio finished, continue with questions
              }}
            />
          </div>
        )}

        {/* Questions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Questions</h2>
          
          <div className="space-y-8">
            {listeningData.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  
                  <div className="flex-1">
                    {/* Question Content */}
                    {question.type === 'FIB' && question.fibData ? (
                      <FillInTheBlankQuestion
                        data={question.fibData}
                        onAnswerChange={(fibAnswers) => {
                          // Convert FIB answers to single answer format
                          const answerText = Object.values(fibAnswers).join(', ')
                          handleAnswerChange(question.id, answerText)
                        }}
                        initialAnswers={answers[question.id] ? 
                          Object.fromEntries(answers[question.id].split(', ').map((val, i) => [`blank-${i}`, val])) : 
                          {}
                        }
                      />
                    ) : (
                      <>
                        <p className="text-gray-900 mb-4">{question.content}</p>
                        
                        {question.type === 'MCQ' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={option.split(') ')[0]}
                                  checked={answers[question.id] === option.split(') ')[0]}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'FIB' && !question.fibData && (
                          <input
                            type="text"
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Your answer..."
                          />
                        )}

                        {question.type === 'TRUE_FALSE' && (
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="TRUE"
                                checked={answers[question.id] === 'TRUE'}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-3 text-gray-700">True</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="FALSE"
                                checked={answers[question.id] === 'FALSE'}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-3 text-gray-700">False</span>
                            </label>
                          </div>
                        )}

                        {question.type === 'NOT_GIVEN' && (
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="TRUE"
                                checked={answers[question.id] === 'TRUE'}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-3 text-gray-700">True</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="FALSE"
                                checked={answers[question.id] === 'FALSE'}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-3 text-gray-700">False</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value="NOT_GIVEN"
                                checked={answers[question.id] === 'NOT_GIVEN'}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-3 text-gray-700">Not Given</span>
                            </label>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? 'Submitting...' : 'Submit & Continue to Reading'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </FullscreenGuard>

  
  )
}
