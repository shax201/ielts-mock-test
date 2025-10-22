'use client'

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
  candidateNumber: string
}

export default function StudentResults() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/student/results')
        if (response.ok) {
          const data = await response.json()
          // Ensure data.results is an array before setting
          const resultsList = Array.isArray(data.results) ? data.results : []
          setResults(resultsList)
        }
      } catch (error) {
        console.error('Error fetching results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Test Results</h1>
          <p className="text-gray-600">View detailed results and performance analysis for all your completed tests.</p>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{result.testTitle}</h3>
                    <p className="text-sm text-gray-500">Candidate Number: {result.candidateNumber}</p>
                    <p className="text-sm text-gray-500">Completed: {new Date(result.completedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{result.overallBand.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Overall Band</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.listeningBand.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Listening</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.readingBand.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Reading</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{result.writingBand.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Writing</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{result.speakingBand.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Speaking</div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <Link href={`/results?token=${result.candidateNumber}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">View Detailed Report</Link>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Download PDF</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-12 sm:p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
            <p className="mt-1 text-sm text-gray-500">Complete your first IELTS test to see results here.</p>
          </div>
        </div>
      )}
    </div>
  )
}


