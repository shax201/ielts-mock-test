'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullscreenGuard from '@/components/test/FullscreenGuard'
import Timer from '@/components/test/Timer'

interface WritingTask {
  id: string
  taskNumber: 1 | 2
  title: string
  instructions: string
  wordCount: number
  timeLimit: number // in minutes
  content: string
}

interface WritingData {
  module: {
    id: string
    type: string
    duration: number
    instructions: string | null
  }
  tasks: WritingTask[]
  assignment: {
    id: string
    candidateNumber: string
    studentName: string
    mockTitle: string
  }
}

export default function WritingModule({ params }: { params: Promise<{ token: string }> }) {
  const [writingData, setWritingData] = useState<WritingData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes in seconds
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [currentTask, setCurrentTask] = useState<1 | 2>(1)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const router = useRouter()

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/student/test-data?token=${encodeURIComponent(resolvedParams.token)}&module=WRITING`)
        const data = await response.json()

        if (response.ok) {
          setWritingData(data)
          setTimeRemaining(data.module.duration * 60) // Convert minutes to seconds
          // Initialize answers with empty strings
          const initialAnswers: Record<string, string> = {}
          data.tasks.forEach((task: WritingTask) => {
            initialAnswers[task.id] = task.content || ''
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
      if (submitted || !writingData) return
      
      setAutoSaveStatus('saving')
      try {
        const resolvedParams = await params
        await fetch(`/api/student/submissions/writing/autosave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: resolvedParams.token,
            answers,
            currentTask
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
  }, [answers, currentTask, submitted, writingData, params])

  const handleAnswerChange = (taskId: string, content: string) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: content
    }))
  }

  const handleSubmit = async () => {
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const resolvedParams = await params
      const response = await fetch(`/api/student/submissions/writing/submit`, {
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
        router.push(`/test/${resolvedParams.token}/speaking`)
      } else {
        console.error('Failed to submit writing answers')
      }
    } catch (error) {
      console.error('Error submitting answers:', error)
    }
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getCurrentTask = () => {
    return writingData?.tasks.find(task => task.taskNumber === currentTask)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!writingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Test</h2>
          <p className="mt-2 text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  const currentTaskData = getCurrentTask()

  return (
    <FullscreenGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Writing Module</h1>
              <p className="text-gray-600">Time: 60 minutes</p>
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
        {/* Task Navigation */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex space-x-4">
            {writingData.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setCurrentTask(task.taskNumber)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentTask === task.taskNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Task {task.taskNumber}
                {task.taskNumber === 1 ? ' (150 words)' : ' (250 words)'}
              </button>
            ))}
          </div>
        </div>

        {/* Current Task */}
        {currentTaskData && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Task {currentTaskData.taskNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  Minimum {currentTaskData.wordCount} words • {currentTaskData.timeLimit} minutes recommended
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Word Count</div>
                <div className={`text-2xl font-bold ${
                  getWordCount(answers[currentTaskData.id] || '') >= currentTaskData.wordCount
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {getWordCount(answers[currentTaskData.id] || '')}
                </div>
                <div className="text-sm text-gray-500">
                  / {currentTaskData.wordCount} minimum
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentTaskData.title}
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {currentTaskData.instructions}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor={`task-${currentTaskData.id}`} className="block text-sm font-medium text-gray-700">
                Your Response
              </label>
              <textarea
                id={`task-${currentTaskData.id}`}
                value={answers[currentTaskData.id] || ''}
                onChange={(e) => handleAnswerChange(currentTaskData.id, e.target.value)}
                disabled={submitted}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Start writing your response here..."
              />
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  {getWordCount(answers[currentTaskData.id] || '') >= currentTaskData.wordCount ? (
                    <span className="text-green-600">✓ Word count requirement met</span>
                  ) : (
                    <span className="text-red-600">
                      Need {currentTaskData.wordCount - getWordCount(answers[currentTaskData.id] || '')} more words
                    </span>
                  )}
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
              Make sure you have completed both tasks before submitting
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? 'Submitting...' : 'Submit & Continue to Speaking'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </FullscreenGuard>
  )
}
