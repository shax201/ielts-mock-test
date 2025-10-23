'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DragDropBuilder from '@/components/admin/DragDropBuilder'

interface MockTestData {
  id: string
  title: string
  description: string
  hasAssignments?: boolean
  modules: {
    id: string
    type: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'
    duration: number
    audioUrl?: string
    instructions: string
    questions: any[]
  }[]
}

export default function EditMockTest() {
  const [currentStep, setCurrentStep] = useState(1)
  const [mockData, setMockData] = useState<MockTestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const loadMockData = async () => {
      try {
        const response = await fetch(`/api/admin/mocks/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to load mock test')
        }
        const data = await response.json()
        setMockData(data.mock)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadMockData()
    }
  }, [params.id])

  const handleSave = async (isDraft = false) => {
    if (!mockData) return

    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/mocks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mockData,
          isDraft
        }),
      })

      if (response.ok) {
        router.push('/admin/mocks')
      } else {
        const errorData = await response.json()
        
        // If it's the assignment protection error, show a helpful message
        if (errorData.error && errorData.error.includes('existing assignments')) {
          setError('This mock test has been assigned to students. You can only save changes as a draft. Click "Save Draft" to save your changes.')
        } else {
          throw new Error(errorData.error || 'Failed to update mock test')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Test title and description' },
    { id: 2, name: 'Listening', description: 'Listening module setup' },
    { id: 3, name: 'Reading', description: 'Reading module setup' },
    { id: 4, name: 'Writing & Speaking', description: 'Writing and Speaking modules' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mock test...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <h3 className="text-lg font-medium">Error</h3>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => router.push('/admin/mocks')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Mock Tests
          </button>
        </div>
      </div>
    )
  }

  if (!mockData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Mock test not found</h3>
          <p className="mt-1 text-gray-600">The requested mock test could not be found.</p>
          <button
            onClick={() => router.push('/admin/mocks')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Mock Tests
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Mock Test</h1>
        <p className="mt-2 text-gray-600">Update your IELTS mock test</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                {currentStep > step.id ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-blue-600" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </>
                ) : currentStep === step.id ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                    </div>
                  </>
                )}
                <div className="ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Assignment Warning */}
      {mockData?.hasAssignments && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                This mock test has been assigned to students
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You can only save changes as a draft to avoid disrupting ongoing tests. Click "Save Draft" to save your changes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Test Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={mockData.title}
                  onChange={(e) => setMockData({ ...mockData, title: e.target.value })}
                  placeholder="e.g., IELTS Academic Mock Test 1"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={mockData.description}
                  onChange={(e) => setMockData({ ...mockData, description: e.target.value })}
                  placeholder="Brief description of this mock test..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <DragDropBuilder
              moduleType="LISTENING"
              initialQuestions={mockData.modules.find(m => m.type === 'LISTENING')?.questions || []}
              onQuestionsChange={(questions) => {
                setMockData({
                  ...mockData,
                  modules: [
                    ...mockData.modules.filter(m => m.type !== 'LISTENING'),
                    {
                      id: mockData.modules.find(m => m.type === 'LISTENING')?.id || `listening-${Date.now()}`,
                      type: 'LISTENING',
                      duration: 40,
                      instructions: 'You will hear a number of different recordings and you will have to answer questions on what you hear.',
                      questions
                    }
                  ]
                })
              }}
            />
          )}

          {currentStep === 3 && (
            <DragDropBuilder
              moduleType="READING"
              initialQuestions={mockData.modules.find(m => m.type === 'READING')?.questions || []}
              onQuestionsChange={(questions) => {
                setMockData({
                  ...mockData,
                  modules: [
                    ...mockData.modules.filter(m => m.type !== 'READING'),
                    {
                      id: mockData.modules.find(m => m.type === 'READING')?.id || `reading-${Date.now()}`,
                      type: 'READING',
                      duration: 60,
                      instructions: 'You should spend about 20 minutes on each passage.',
                      questions
                    }
                  ]
                })
              }}
            />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Writing Module</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task 1 Instructions
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Describe the information shown in the chart/graph..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task 2 Instructions
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Write an essay discussing both views..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Speaking Module</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Part 1 Questions
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="What is your hometown like? Do you like it?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Part 2 Cue Card
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Describe a memorable journey you have taken..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Part 3 Discussion
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="How has travel changed in your country over the past 20 years?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  mockData?.hasAssignments 
                    ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                }`}
              >
                {saving ? 'Saving...' : 'Save Draft'}
                {mockData?.hasAssignments && (
                  <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving || mockData?.hasAssignments}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    mockData?.hasAssignments 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {saving ? 'Updating...' : mockData?.hasAssignments ? 'Cannot Update (Has Assignments)' : 'Update Test'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
