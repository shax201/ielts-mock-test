'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DragDropBuilder from '@/components/admin/DragDropBuilder'

interface MockTestData {
  title: string
  description: string
  modules: {
    type: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'
    duration: number
    audioUrl?: string
    instructions: string
    questions: any[]
  }[]
}

export default function CreateMockTest() {
  const [currentStep, setCurrentStep] = useState(1)
  const [mockData, setMockData] = useState<MockTestData>({
    title: '',
    description: '',
    modules: []
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async (isDraft = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/mocks', {
        method: 'POST',
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
        console.error('Failed to save mock test')
      }
    } catch (error) {
      console.error('Error saving mock test:', error)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Test title and description' },
    { id: 2, name: 'Listening', description: 'Listening module setup' },
    { id: 3, name: 'Reading', description: 'Reading module setup' },
    { id: 4, name: 'Writing & Speaking', description: 'Writing and Speaking modules' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Mock Test</h1>
        <p className="mt-2 text-gray-600">Build a comprehensive IELTS mock test</p>
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
              onQuestionsChange={(questions) => {
                setMockData({
                  ...mockData,
                  modules: [
                    ...mockData.modules.filter(m => m.type !== 'LISTENING'),
                    {
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
              onQuestionsChange={(questions) => {
                setMockData({
                  ...mockData,
                  modules: [
                    ...mockData.modules.filter(m => m.type !== 'READING'),
                    {
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
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Save Draft
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
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Test'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
