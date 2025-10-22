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
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/student/dashboard')
        if (response.ok) {
          const data = await response.json()
          // Ensure activeTests is an array and recentResults is an array before setting
          const dashboardData = {
            ...data,
            activeTests: Array.isArray(data.activeTests) ? data.activeTests : [],
            recentResults: Array.isArray(data.recentResults) ? data.recentResults : []
          }
          setStats(dashboardData)
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

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  )
}


