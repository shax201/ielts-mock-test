"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TestResult {
  id: string
  testTitle: string
  overallBand: number
  listeningBand: number
  readingBand: number
  writingBand: number
  speakingBand: number
  completedAt: string
  status: string
}

interface ParticipationHistoryItem {
  id: string
  testTitle: string
  testDescription: string
  candidateNumber: string
  status: string
  assignedAt: string
  validFrom: string
  validUntil: string
  completedAt: string | null
  testDuration: number | null
  progressPercentage: number
  moduleStatus: Array<{
    module: string
    status: string
    submittedAt: string | null
    autoScore: number | null
    instructorMarked: boolean
  }>
  overallBand: number | null
  moduleBands: {
    listening: number | null
    reading: number | null
    writing: number | null
    speaking: number | null
  }
  hasResult: boolean
  isExpired: boolean
  canRetake: boolean
}

interface DashboardStats {
  totalTests: number
  activeTestsCount: number
  averageBand: number
  highestBand: number
  moduleAverages: {
    listening: number
    reading: number
    writing: number
    speaking: number
  }
  recentResults: TestResult[]
  activeTests: Array<{
    id: string
    title: string
    token: string
    validUntil: string
  }>
  participationHistory: ParticipationHistoryItem[]
  summaryStats: {
    totalTests: number
    completedTests: number
    activeTests: number
    expiredTests: number
    averageBand: number
    totalTestTime: number
  }
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, historyResponse] = await Promise.all([
          fetch('/api/student/dashboard'),
          fetch('/api/student/participation-history?limit=5')
        ])

        if (dashboardResponse.ok && historyResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          const historyData = await historyResponse.json()
          
          // Ensure activeTests is an array and recentResults is an array before setting
          const combinedData = {
            ...dashboardData,
            activeTests: Array.isArray(dashboardData.activeTests) ? dashboardData.activeTests : [],
            recentResults: Array.isArray(dashboardData.recentResults) ? dashboardData.recentResults : [],
            participationHistory: Array.isArray(historyData.participationHistory) ? historyData.participationHistory : [],
            summaryStats: historyData.summaryStats || {
              totalTests: 0,
              completedTests: 0,
              activeTests: 0,
              expiredTests: 0,
              averageBand: 0,
              totalTestTime: 0
            }
          }
          setStats(combinedData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your IELTS Portal</h1>
          <p className="text-gray-600">
            Track your progress, view results, and access your test history.
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Tests</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalTests}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Tests</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeTestsCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Band</dt>
                    <dd className="text-lg font-medium text-gray-900">{Math.round(stats.averageBand)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Highest Band</dt>
                    <dd className="text-lg font-medium text-gray-900">{Math.round(stats.highestBand)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Performance */}
      {stats && stats.moduleAverages && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Module Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(stats.moduleAverages.listening)}</div>
                <div className="text-sm text-gray-500">Listening</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(stats.moduleAverages.reading)}</div>
                <div className="text-sm text-gray-500">Reading</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{Math.round(stats.moduleAverages.writing)}</div>
                <div className="text-sm text-gray-500">Writing</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.moduleAverages.speaking)}</div>
                <div className="text-sm text-gray-500">Speaking</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Tests */}
      {stats && stats.activeTests && Array.isArray(stats.activeTests) && stats.activeTests.length > 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Available Tests</h2>
            <div className="space-y-3">
              {stats.activeTests.map((test, index) => {
                // Safety check for test object
                if (!test || typeof test !== 'object' || !test.id) {
                  return null
                }
                return (
                  <div key={test.id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{test.title || 'Untitled Test'}</h3>
                      <p className="text-xs text-gray-500">
                        Valid until: {test.validUntil ? new Date(test.validUntil).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Link
                      href={`/test/${test.token || ''}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Start Test
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Test Results</h2>
          {stats && stats.recentResults && Array.isArray(stats.recentResults) && stats.recentResults.length > 0 ? (
            <div className="space-y-4">
              {stats.recentResults.slice(0, 3).map((result, index) => {
                // Safety check for result object
                if (!result || typeof result !== 'object') {
                  return null
                }
                return (
                  <div key={result.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{result.testTitle || 'Untitled Test'}</h3>
                        <p className="text-sm text-gray-500">
                          Completed: {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{Math.round(result.overallBand || 0)}</div>
                        <div className="text-xs text-gray-500">Overall Band</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{Math.round(result.listeningBand || 0)}</div>
                        <div className="text-xs text-gray-500">Listening</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{Math.round(result.readingBand || 0)}</div>
                        <div className="text-xs text-gray-500">Reading</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{Math.round(result.writingBand || 0)}</div>
                        <div className="text-xs text-gray-500">Writing</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{Math.round(result.speakingBand || 0)}</div>
                        <div className="text-xs text-gray-500">Speaking</div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="text-center">
                <Link href="/student/results" className="text-blue-600 hover:text-blue-500 text-sm font-medium">View All Results →</Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No test results yet</h3>
              <p className="mt-1 text-sm text-gray-500">Complete your first IELTS test to see results here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Participation History */}
      {stats && stats.participationHistory && stats.participationHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Test Participation</h2>
              <Link href="/student/participation-history" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {stats.participationHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.testTitle}</h3>
                      <p className="text-xs text-gray-500">
                        Candidate: {item.candidateNumber} • Assigned: {new Date(item.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                        item.isExpired ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'COMPLETED' ? 'Completed' :
                         item.status === 'ACTIVE' ? 'Active' :
                         item.isExpired ? 'Expired' : item.status}
                      </span>
                      {item.overallBand && (
                        <span className="text-lg font-bold text-blue-600">{Math.round(item.overallBand)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{item.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${item.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Module Status */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {item.moduleStatus.map((module) => (
                      <div key={module.module} className="text-xs">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1 ${
                          module.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                          module.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {module.status === 'COMPLETED' ? '✓' : 
                           module.status === 'IN_PROGRESS' ? '⏳' : '○'}
                        </div>
                        <div className="text-gray-500 capitalize">{module.module}</div>
                        {module.autoScore && (
                          <div className="text-xs font-medium">{Math.round(module.autoScore)}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Test Duration */}
                  {item.testDuration && (
                    <div className="mt-3 text-xs text-gray-500">
                      Duration: {item.testDuration} minutes
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/student/results" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">View All Results</h3>
                <p className="text-sm text-gray-500">See detailed results and performance analysis</p>
              </div>
            </Link>

            <Link href="/student/tests" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Test History</h3>
                <p className="text-sm text-gray-500">View all your completed tests and assignments</p>
              </div>
            </Link>

            <Link href="/student/participation-history" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Participation History</h3>
                <p className="text-sm text-gray-500">Detailed view of all your test participation</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


