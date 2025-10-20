'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Timer from '@/components/test/Timer'

interface SpeakingQuestion {
  id: string
  part: number
  question: string
  response: string
  timeLimit?: number
}

export default function SpeakingModule({ params }: { params: Promise<{ token: string }> }) {
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([
    {
      id: 'part1-1',
      part: 1,
      question: 'What is your hometown like? Do you like it?',
      response: '',
      timeLimit: 2
    },
    {
      id: 'part1-2',
      part: 1,
      question: 'What do you like to do in your free time?',
      response: '',
      timeLimit: 2
    },
    {
      id: 'part2',
      part: 2,
      question: 'Describe a memorable journey you have taken. You should say: where you went, who you went with, what you did there, and explain why this journey was memorable.',
      response: '',
      timeLimit: 4
    },
    {
      id: 'part3-1',
      part: 3,
      question: 'How has travel changed in your country over the past 20 years?',
      response: '',
      timeLimit: 3
    },
    {
      id: 'part3-2',
      part: 3,
      question: 'What are the benefits of traveling to different countries?',
      response: '',
      timeLimit: 3
    }
  ])
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (timeRemaining <= 0 && !submitted) {
      handleSubmit()
    }
  }, [timeRemaining, submitted])

  const handleResponseChange = (questionId: string, response: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, response } : q
    ))
  }

  const handleSubmit = async () => {
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const response = await fetch(`/api/student/submissions/speaking/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: (await params).token,
          questions,
          timeSpent: 15 * 60 - timeRemaining
        }),
      })

      if (response.ok) {
        const resolvedParams = await params;
        router.push(`/test/${resolvedParams.token}/complete`)
      } else {
        console.error('Failed to submit speaking answers')
      }
    } catch (error) {
      console.error('Error submitting answers:', error)
    }
  }

  const getPartTitle = (part: number) => {
    switch (part) {
      case 1: return 'Part 1: Introduction and Interview'
      case 2: return 'Part 2: Individual Long Turn'
      case 3: return 'Part 3: Two-way Discussion'
      default: return `Part ${part}`
    }
  }

  const getPartDescription = (part: number) => {
    switch (part) {
      case 1: return 'Answer questions about yourself and familiar topics (4-5 minutes)'
      case 2: return 'Speak for 1-2 minutes on a given topic (3-4 minutes)'
      case 3: return 'Discuss abstract topics related to Part 2 (4-5 minutes)'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Speaking Module</h1>
              <p className="text-gray-600">Time: 15 minutes</p>
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
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Speaking Test Instructions</h2>
          <p className="text-blue-800 mb-4">
            In this section, you will type your responses to speaking questions instead of speaking aloud. 
            This simulates the speaking test format.
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Part 1: Answer questions about yourself and familiar topics</li>
            <li>Part 2: Describe a topic in detail for 1-2 minutes</li>
            <li>Part 3: Discuss abstract topics related to Part 2</li>
          </ul>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getPartTitle(question.part)}
                  </span>
                  {question.timeLimit && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {question.timeLimit} min
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{getPartDescription(question.part)}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Question {index + 1}
                </h3>
                <p className="text-gray-700 mb-4">{question.question}</p>
              </div>

              <div>
                <label htmlFor={`response-${question.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  id={`response-${question.id}`}
                  rows={6}
                  value={question.response}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={submitted}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {question.response.length} characters
                </p>
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
            {submitted ? 'Submitting...' : 'Complete Test'}
          </button>
        </div>
      </div>
    </div>
  )
}
