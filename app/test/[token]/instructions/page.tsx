'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioPlayer from '@/components/test/AudioPlayer'

interface AssignmentData {
  id: string
  candidateNumber: string
  studentName: string
  mockTitle: string
  validFrom: string
  validUntil: string
  status: string
}

export default function InstructionsPage({ params }: { params: Promise<{ token: string }> }) {
  const [assignment, setAssignment] = useState<AssignmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [instructionsAccepted, setInstructionsAccepted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/student/validate-token?token=${encodeURIComponent(resolvedParams.token)}`)
        const data = await response.json()

        if (response.ok) {
          setAssignment(data.assignment)
        } else {
          setError(data.error || 'Invalid token')
        }
      } catch (error) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params])

  const handleStartTest = async () => {
    if (!instructionsAccepted) return
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
    } catch (_err) {
      // If the browser blocks programmatic fullscreen, the guard will show
    } finally {
      const resolvedParams = await params
      router.push(`/test/${resolvedParams.token}/reading`)
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
<<<<<<< HEAD
=======
   
>>>>>>> main
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IELTS Mock Test Instructions</h1>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900">Test Information</h2>
            <div className="mt-2 text-sm text-blue-800">
              <p><strong>Candidate Number:</strong> {assignment?.candidateNumber}</p>
              <p><strong>Test:</strong> {assignment?.mockTitle}</p>
              <p><strong>Valid Until:</strong> {assignment?.validUntil ? new Date(assignment.validUntil).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Format</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Listening (40 minutes)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>You will hear a number of different recordings</li>
                <li>You will have to answer questions on what you hear</li>
                <li>The audio will play automatically and cannot be paused or replayed</li>
                <li>You will have 10 minutes at the end to transfer your answers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reading (60 minutes)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>You will read three passages and answer questions</li>
                <li>You should spend about 20 minutes on each passage</li>
                <li>Answer all questions in the time allowed</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Demo Audio */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Audio</h2>
          <p className="text-gray-700 mb-4">
            This is a sample of how the audio will play during the Listening test. 
            The audio cannot be paused or replayed.
          </p>
          <AudioPlayer 
            src="/demo-audio.mp3" // This would be a real demo audio file
            demo={true}
          />
        </div>

        {/* Important Rules */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">Important Rules</h2>
          <ul className="list-disc list-inside text-yellow-800 space-y-2">
            <li>Do not refresh the page or navigate away during the test</li>
            <li>Do not use any external resources or dictionaries</li>
            <li>Answer all questions in the time allowed</li>
            <li>Your progress will be automatically saved</li>
            <li>Once you start a module, you cannot go back to previous modules</li>
          </ul>
        </div>

        {/* Acceptance Checkbox */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="instructions-accepted"
                name="instructions-accepted"
                type="checkbox"
                checked={instructionsAccepted}
                onChange={(e) => setInstructionsAccepted(e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="instructions-accepted" className="font-medium text-gray-900">
                I have read and understood the test instructions and rules
              </label>
              <p className="text-gray-500">
                By checking this box, I confirm that I understand the test format and agree to follow all rules.
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartTest}
            disabled={!instructionsAccepted}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
            Begin Test
          </button>
        </div>
      </div>
    </div>
<<<<<<< HEAD
=======
 
>>>>>>> main
  )
}
