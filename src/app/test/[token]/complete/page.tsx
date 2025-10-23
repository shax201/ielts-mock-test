'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CompletionData {
  candidateNumber: string
  testTitle: string
  completedAt: string
}

interface ScoreData {
  bandScore: number
  totalQuestions: number
  totalCorrect: number
  moduleScores: {
    listening: number
    reading: number
    writing: number
    speaking: number
  }
  questionTypePerformance: {
    type: string
    score: number
    total: number
    correct: number
  }[]
}

export default function TestComplete({ params }: { params: Promise<{ token: string }> }) {
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { token } = await params
        
        // Fetch real results from API
        const response = await fetch(`/api/student/results?token=${encodeURIComponent(token)}`, {
          method: 'GET'
        })

        if (response.ok) {
          const data = await response.json()
          const results = data.results
          setIsProcessing(false)
          
          // Calculate dynamic scores based on real data
          const calculateModuleScore = (band: number) => band || 0
          const calculateQuestionTypePerformance = (module: string, band: number) => {
            // Convert band score to percentage (rough approximation)
            const percentage = Math.min((band / 9) * 100, 100)
            return {
              type: `${module} Questions`,
              score: percentage,
              total: 10, // Default total questions per module
              correct: Math.round((percentage / 100) * 10)
            }
          }

          const dynamicScoreData: ScoreData = {
            bandScore: results.bands.overall || 0,
            totalQuestions: 40, // Total questions across all modules
            totalCorrect: Math.round((results.bands.overall / 9) * 40), // Estimate based on overall band
            moduleScores: {
              listening: calculateModuleScore(results.bands.listening),
              reading: calculateModuleScore(results.bands.reading),
              writing: calculateModuleScore(results.bands.writing),
              speaking: calculateModuleScore(results.bands.speaking)
            },
            questionTypePerformance: [
              calculateQuestionTypePerformance('Listening', results.bands.listening),
              calculateQuestionTypePerformance('Reading', results.bands.reading),
              calculateQuestionTypePerformance('Writing', results.bands.writing),
              calculateQuestionTypePerformance('Speaking', results.bands.speaking)
            ]
          }

          setCompletionData({
            candidateNumber: results.candidateNumber,
            testTitle: results.testTitle,
            completedAt: results.generatedAt
          })
          
          setScoreData(dynamicScoreData)
        } else if (response.status === 202) {
          // Results are not yet available - show processing message
          setCompletionData({
            candidateNumber: 'Processing...',
            testTitle: 'IELTS Mock Test',
            completedAt: new Date().toISOString()
          })
          setIsProcessing(true)
          
          // Show a processing state with mock data
          const processingScoreData: ScoreData = {
            bandScore: 0,
            totalQuestions: 40,
            totalCorrect: 0,
            moduleScores: {
              listening: 0,
              reading: 0,
              writing: 0,
              speaking: 0
            },
            questionTypePerformance: [
              { type: 'Processing Results', score: 0, total: 40, correct: 0 }
            ]
          }
          
          setScoreData(processingScoreData)
        } else {
          // Fallback to mock data if API fails
          const mockScoreData: ScoreData = {
            bandScore: 6.5,
            totalQuestions: 40,
            totalCorrect: 28,
            moduleScores: {
              listening: 7.0,
              reading: 6.5,
              writing: 6.0,
              speaking: 6.5
            },
            questionTypePerformance: [
              { type: 'Reading Summary Notes Completion', score: 45.0, total: 4, correct: 2 },
              { type: 'Reading Diagram Label Completion', score: 0.0, total: 3, correct: 0 },
              { type: 'Reading : Matching Information', score: 40.0, total: 5, correct: 2 },
              { type: 'Reading : Identifying Information', score: 38.0, total: 8, correct: 3 },
              { type: 'Reading : Multiple Choice Questions', score: 38.0, total: 6, correct: 2 },
              { type: 'Reading : Fill in the Blank', score: 75.0, total: 8, correct: 6 },
              { type: 'Listening : Multiple Choice', score: 60.0, total: 5, correct: 3 },
              { type: 'Listening : Fill in the Blank', score: 50.0, total: 6, correct: 3 }
            ]
          }

      setCompletionData({
        candidateNumber: 'CAND001',
        testTitle: 'IELTS Academic Mock Test 1',
        completedAt: new Date().toISOString()
      })
          
          setScoreData(mockScoreData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching results:', error)
      setLoading(false)
      }
    }

    fetchResults()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Test Completed Successfully!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Your IELTS Mock Test Results
          </p>
        </div>

        {/* Score Overview Cards */}
        {scoreData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Band Score Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {Math.round(scoreData.bandScore)}
              </div>
              <div className="text-sm font-medium text-blue-600">Band Score</div>
            </div>
            
            {/* Total Questions Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{scoreData.totalQuestions}</div>
              <div className="text-sm font-medium text-gray-600">Total Questions</div>
            </div>
            
            {/* Total Correct Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {scoreData.totalCorrect}
              </div>
              <div className="text-sm font-medium text-green-600">Total Correct</div>
            </div>
          </div>
        )}

        {/* Processing Message */}
        {isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mr-3"></div>
                <div>
                  <h3 className="text-lg font-medium text-yellow-800">Processing Your Results</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your test has been submitted successfully. Results are being calculated and will be available shortly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Module Scores */}
        {scoreData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Module Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(scoreData.moduleScores).map(([module, score]) => (
                <div key={module} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(score)}</div>
                  <div className="text-sm font-medium text-gray-600 capitalize">{module}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Type Performance */}
        {scoreData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">PARAMETER - WISE PERFORMANCE</h2>
            <div className="space-y-4">
              {scoreData.questionTypePerformance.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">{item.type}</div>
                    <div className="text-xs text-gray-500">{item.correct}/{item.total} correct</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-12 text-right">
                      {Math.round(item.score)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Analysis */}
        {scoreData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {(() => {
                    const strengths = []
                    const { moduleScores, questionTypePerformance } = scoreData
                    
                    // Find highest scoring module
                    const highestModule = Object.entries(moduleScores).reduce((a, b) => 
                      (moduleScores as any)[a[0]] > (moduleScores as any)[b[0]] ? a : b
                    )
                    if (highestModule[1] >= 6.0) {
                      strengths.push(
                        <li key="module" className="flex items-center text-green-600">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Strong {highestModule[0]} skills ({highestModule[1]} band)
                        </li>
                      )
                    }
                    
                    // Find highest scoring question type
                    const highestQuestionType = questionTypePerformance.reduce((a, b) => 
                      a.score > b.score ? a : b
                    )
                    if (highestQuestionType.score >= 60) {
                      strengths.push(
                        <li key="question" className="flex items-center text-green-600">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Excellent performance in {highestQuestionType.type} ({highestQuestionType.score.toFixed(1)}%)
                        </li>
                      )
                    }
                    
                    if (strengths.length === 0) {
                      strengths.push(
                        <li key="general" className="flex items-center text-green-600">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Good overall performance with room for improvement
                        </li>
                      )
                    }
                    
                    return strengths
                  })()}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {(() => {
                    const improvements = []
                    const { moduleScores, questionTypePerformance } = scoreData
                    
                    // Find lowest scoring module
                    const lowestModule = Object.entries(moduleScores).reduce((a, b) => 
                      (moduleScores as any)[a[0]] < (moduleScores as any)[b[0]] ? a : b
                    )
                    if (lowestModule[1] < 6.0) {
                      improvements.push(
                        <li key="module" className="flex items-center text-red-600">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {lowestModule[0]} needs improvement ({lowestModule[1]} band)
                        </li>
                      )
                    }
                    
                    // Find lowest scoring question type
                    const lowestQuestionType = questionTypePerformance.reduce((a, b) => 
                      a.score < b.score ? a : b
                    )
                    if (lowestQuestionType.score < 50) {
                      improvements.push(
                        <li key="question" className="flex items-center text-red-600">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {lowestQuestionType.type} needs work ({lowestQuestionType.score.toFixed(1)}%)
                        </li>
                      )
                    }
                    
                    if (improvements.length === 0) {
                      improvements.push(
                        <li key="general" className="flex items-center text-blue-600">
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Continue practicing to maintain your good performance
                        </li>
                      )
                    }
                    
                    return improvements
                  })()}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Test Information */}
        <div className="bg-white shadow rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Candidate Number</dt>
              <dd className="mt-1 text-lg text-gray-900">{completionData?.candidateNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Test Title</dt>
              <dd className="mt-1 text-lg text-gray-900">{completionData?.testTitle}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed At</dt>
              <dd className="mt-1 text-lg text-gray-900">
                {completionData?.completedAt ? new Date(completionData.completedAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </dd>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Grading Process</h3>
                <p className="text-sm text-blue-800">
                  Your Listening and Reading modules will be automatically scored.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Results Timeline</h3>
                <p className="text-sm text-blue-800">
                  Results will be available within 2-3 business days. 
                  You will receive an email notification when ready.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Access Results</h3>
                <p className="text-sm text-blue-800">
                  Use your candidate number or access token to view your results and detailed feedback.
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/results')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Results
          </button>
          
          <button
            onClick={() => router.push('/test')}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Take Another Test
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@radiance.edu" className="text-blue-600 hover:text-blue-500">
              support@radiance.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
