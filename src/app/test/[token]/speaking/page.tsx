'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'

interface SpeakingPart {
  id: string
  partNumber: 1 | 2 | 3
  title: string
  instructions: string
  timeLimit: number // in minutes
  content: string
  questions?: string[]
  topicCard?: {
    title: string
    bulletPoints: string[]
  }
}

interface SpeakingData {
  module: {
    id: string
    type: string
    duration: number
    instructions: string | null
  }
  parts: SpeakingPart[]
  assignment: {
    id: string
    candidateNumber: string
    studentName: string
    mockTitle: string
  }
}

export default function SpeakingModule({ params }: { params: Promise<{ token: string }> }) {
  const [speakingData, setSpeakingData] = useState<SpeakingData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const router = useRouter()

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/student/test-data?token=${encodeURIComponent(resolvedParams.token)}&module=SPEAKING`)
        const data = await response.json()

        if (response.ok) {
          setSpeakingData(data)
          setTimeRemaining(data.module.duration * 60) // Convert minutes to seconds
          // Initialize answers with empty strings
          const initialAnswers: Record<string, string> = {}
          data.parts.forEach((part: SpeakingPart) => {
            initialAnswers[part.id] = part.content || ''
          })
          setAnswers(initialAnswers)
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

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (submitted || !speakingData) return
      
      setAutoSaveStatus('saving')
      try {
        const resolvedParams = await params
        await fetch(`/api/student/submissions/speaking/autosave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: resolvedParams.token,
            answers,
            currentPart
          }),
        })
        setAutoSaveStatus('saved')
      } catch (error) {
        setAutoSaveStatus('error')
        console.error('Auto-save failed:', error)
      }
    }

    const interval = setInterval(autoSave, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [answers, currentPart, submitted, speakingData, params])

  const handleAnswerChange = (partId: string, content: string) => {
    setAnswers(prev => ({
      ...prev,
      [partId]: content
    }))
  }

  const handleSubmit = async () => {
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const resolvedParams = await params
      const response = await fetch(`/api/student/submissions/speaking/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          answers,
          timeSpent: 15 * 60 - timeRemaining
        }),
      })

      if (response.ok) {
        router.push(`/test/${resolvedParams.token}/complete`)
      } else {
        console.error('Failed to submit speaking answers')
      }
    } catch (error) {
      console.error('Error submitting answers:', error)
    }
  }

  const getCurrentPart = () => {
    return speakingData?.parts.find(part => part.partNumber === currentPart)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!speakingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Test</h2>
          <p className="mt-2 text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  const currentPartData = getCurrentPart()

  return (
    <FullscreenGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Speaking Module</h1>
              <p className="text-gray-600">Time: 15 minutes</p>
            </div>
            <div className="flex items-center space-x-4">
              <Timer 
                timeRemaining={timeRemaining}
                onTimeUp={() => handleSubmit()}
              />
              <div className="text-sm text-gray-500">
                {autoSaveStatus === 'saved' && '✓ Saved'}
                {autoSaveStatus === 'saving' && 'Saving...'}
                {autoSaveStatus === 'error' && '⚠ Save Error'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Part Navigation */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex space-x-4">
            {speakingData.parts.map((part) => (
              <button
                key={part.id}
                onClick={() => setCurrentPart(part.partNumber)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentPart === part.partNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Part {part.partNumber}
                {part.partNumber === 1 && ' (4-5 min)'}
                {part.partNumber === 2 && ' (3-4 min)'}
                {part.partNumber === 3 && ' (4-5 min)'}
              </button>
            ))}
          </div>
        </div>

        {/* Current Part */}
        {currentPartData && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Part {currentPartData.partNumber}
              </h2>
              <p className="text-gray-600 mb-4">
                {currentPartData.timeLimit} minutes recommended
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentPartData.title}
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {currentPartData.instructions}
                </p>
              </div>
            </div>

            {/* Topic Card for Part 2 */}
            {currentPartData.partNumber === 2 && currentPartData.topicCard && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4">
                  Topic Card
                </h4>
                <h5 className="text-md font-medium text-yellow-800 mb-3">
                  {currentPartData.topicCard.title}
                </h5>
                <ul className="list-disc list-inside text-yellow-800 space-y-1">
                  {currentPartData.topicCard.bulletPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions for Part 1 and 3 */}
            {(currentPartData.partNumber === 1 || currentPartData.partNumber === 3) && currentPartData.questions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">
                  Questions
                </h4>
                <ul className="space-y-2">
                  {currentPartData.questions.map((question, index) => (
                    <li key={index} className="text-blue-800">
                      {index + 1}. {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <label htmlFor={`part-${currentPartData.id}`} className="block text-sm font-medium text-gray-700">
                Your Response (Type your answers as if you were speaking)
              </label>
              <textarea
                id={`part-${currentPartData.id}`}
                value={answers[currentPartData.id] || ''}
                onChange={(e) => handleAnswerChange(currentPartData.id, e.target.value)}
                disabled={submitted}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Type your response here as if you were speaking..."
              />
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  Part {currentPartData.partNumber} response
                </div>
                <div>
                  Auto-saves every 30 seconds
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Make sure you have completed all three parts before submitting
            </div>
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
    </FullscreenGuard>
  )
}
