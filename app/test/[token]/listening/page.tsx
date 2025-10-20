'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioPlayer from '@/components/test/AudioPlayer'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'

interface Question {
  id: string
  type: 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN'
  content: string
  options?: string[]
  correctAnswer: string | string[]
  points: number
}

interface ListeningData {
  questions: Question[]
  audioUrl: string
  instructions: string
}

export default function ListeningModule({ params }: { params: Promise<{ token: string }> }) {
  const [listeningData, setListeningData] = useState<ListeningData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(40 * 60) // 40 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // TODO: Fetch listening module data from API
    // For now, using mock data
    setTimeout(() => {
      setListeningData({
        questions: [
          {
            id: 'q1',
            type: 'MCQ',
            content: 'What is the main topic of the conversation?',
            options: ['A) Weather', 'B) Travel', 'C) Food', 'D) Sports'],
            correctAnswer: 'B',
            points: 1
          },
          {
            id: 'q2',
            type: 'FIB',
            content: 'The speaker mentions that the journey takes approximately _____ hours.',
            correctAnswer: 'three',
            points: 1
          }
        ],
        audioUrl: '/demo-audio.mp3',
        instructions: 'You will hear a conversation between two people. Answer the questions based on what you hear.'
      })
      setLoading(false)
    }, 1000)
  }, [])

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
      const response = await fetch(`/api/student/submissions/listening/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: (await params).token,
          answers,
          timeSpent: 40 * 60 - timeRemaining
        }),
      })

      if (response.ok) {
        const resolvedParams = await params;
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
          <p className="text-blue-800">{listeningData.instructions}</p>
        </div>

        {/* Audio Player */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio</h2>
          <AudioPlayer 
            src={listeningData.audioUrl}
            onEnded={() => {
              // Audio finished, continue with questions
            }}
          />
        </div>

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
                    
                    {question.type === 'FIB' && (
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Your answer..."
                      />
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
