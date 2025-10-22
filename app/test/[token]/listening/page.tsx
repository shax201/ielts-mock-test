'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'
import AudioPlayer from '@/components/test/AudioPlayer'
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

interface ListeningData {
  module: {
    id: string
    type: string
    duration: number
    instructions: string | null
    audioUrl?: string
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
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})
  const [timeRemaining, setTimeRemaining] = useState(40 * 60) // 40 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [audioFinished, setAudioFinished] = useState(false)
  const [transferTime, setTransferTime] = useState(10 * 60) // 10 minutes transfer time
  const [inTransferMode, setInTransferMode] = useState(false)
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
    if (timeRemaining <= 0 && !submitted && !inTransferMode) {
      // Start transfer time
      setInTransferMode(true)
      setTransferTime(10 * 60) // 10 minutes for transfer
    }
  }, [timeRemaining, submitted, inTransferMode])

  useEffect(() => {
    if (inTransferMode && transferTime <= 0 && !submitted) {
      handleSubmit()
    }
  }, [transferTime, inTransferMode, submitted])

  const handleAnswerChange = (questionId: string, answer: string | Record<string, string>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleAudioFinished = () => {
    setAudioFinished(true)
    // Start transfer time after audio finishes
    setInTransferMode(true)
    setTransferTime(10 * 60)
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
          timeSpent: 40 * 60 - timeRemaining + (10 * 60 - transferTime)
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
              <p className="text-gray-600">
                {inTransferMode ? 'Transfer Time: 10 minutes' : 'Time: 40 minutes'}
              </p>
            </div>
            <Timer 
              timeRemaining={inTransferMode ? transferTime : timeRemaining}
              onTimeUp={() => handleSubmit()}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h2>
          <p className="text-blue-800">
            {listeningData.module.instructions || 
             'You will hear a number of different recordings. You will have to answer questions on what you hear. The audio will play automatically and cannot be paused or replayed. You will have 10 minutes at the end to transfer your answers.'}
          </p>
        </div>

        {/* Audio Player */}
        {!audioFinished && !inTransferMode && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Audio Recording</h2>
            <AudioPlayer 
              src={listeningData.module.audioUrl || '/demo-audio.mp3'}
              onEnded={handleAudioFinished}
              autoPlay={true}
            />
          </div>
        )}

        {/* Transfer Mode Notice */}
        {inTransferMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">Transfer Time</h2>
            <p className="text-yellow-800">
              You now have 10 minutes to transfer your answers to the answer sheet. 
              Make sure all answers are clearly written and legible.
            </p>
          </div>
        )}

        {/* Questions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {inTransferMode ? 'Answer Sheet' : 'Questions'}
          </h2>
          
          <div className="space-y-8">
            {listeningData.questions.map((question, index) => {
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
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-4">{question.content}</p>
                      
                      {question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                disabled={submitted}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitted || (!audioFinished && !inTransferMode)}
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
