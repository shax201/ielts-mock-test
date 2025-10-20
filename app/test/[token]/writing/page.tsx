'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Timer from '@/components/test/Timer'

interface WritingTask {
  id: string
  title: string
  instructions: string
  minWords: number
  content: string
}

export default function WritingModule({ params }: { params: Promise<{ token: string }> }) {
  const [tasks, setTasks] = useState<WritingTask[]>([
    {
      id: 'task1',
      title: 'Task 1',
      instructions: 'You should spend about 20 minutes on this task. Write at least 150 words.',
      minWords: 150,
      content: ''
    },
    {
      id: 'task2',
      title: 'Task 2',
      instructions: 'You should spend about 40 minutes on this task. Write at least 250 words.',
      minWords: 250,
      content: ''
    }
  ])
  const [activeTask, setActiveTask] = useState('task1')
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    try {
      const resolvedParams = await params;
      await fetch(`/api/student/submissions/writing/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          tasks
        }),
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [params, tasks])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [autoSave])

  useEffect(() => {
    if (timeRemaining <= 0 && !submitted) {
      handleSubmit()
    }
  }, [timeRemaining, submitted])

  const handleTaskChange = (taskId: string, content: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, content } : task
    ))
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getCurrentTask = () => {
    return tasks.find(task => task.id === activeTask) || tasks[0]
  }

  const handleSubmit = async () => {
    if (submitted) return
    
    setSubmitted(true)
    
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/student/submissions/writing/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          tasks,
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

  const currentTask = getCurrentTask()
  const wordCount = getWordCount(currentTask?.content || '')
  const isMinWordsMet = wordCount >= (currentTask?.minWords || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Writing Module</h1>
              <p className="text-gray-600">Time: 60 minutes</p>
            </div>
            <Timer 
              timeRemaining={timeRemaining}
              onTimeUp={() => handleSubmit()}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Task Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={`${
                    activeTask === task.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{task.title}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getWordCount(task.content) >= task.minWords
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getWordCount(task.content)}/{task.minWords} words
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Instructions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {currentTask?.title} Instructions
              </h2>
              <p className="text-gray-700 mb-4">{currentTask?.instructions}</p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Task 1 Example</h3>
                  <p className="text-sm text-blue-800">
                    The chart below shows the percentage of households in different income brackets in City A and City B.
                    Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Task 2 Example</h3>
                  <p className="text-sm text-green-800">
                    Some people believe that technology has made our lives more complicated, while others think it has made life easier.
                    Discuss both views and give your own opinion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Writing Area */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentTask?.title}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className={`text-sm font-medium ${
                      isMinWordsMet ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {wordCount} words
                    </div>
                    <div className="text-sm text-gray-500">
                      Min: {currentTask?.minWords}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <textarea
                  value={currentTask?.content || ''}
                  onChange={(e) => handleTaskChange(activeTask, e.target.value)}
                  placeholder="Start writing your response here..."
                  className="w-full h-96 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                  disabled={submitted}
                />
                
                {!isMinWordsMet && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      You need to write at least {currentTask?.minWords} words for this task.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
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
    </div>
  )
}
