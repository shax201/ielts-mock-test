'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TestAssignment {
  id: string
  testTitle: string
  status: string
  assignedAt: string
  validFrom: string
  validUntil: string
  accessToken: string
  hasResult: boolean
  overallBand?: number
}

export default function StudentTests() {
  const [assignments, setAssignments] = useState<TestAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/student/assignments')
        if (response.ok) {
          const data = await response.json()
          // Ensure data.assignments is an array before setting
          const assignmentsList = Array.isArray(data.assignments) ? data.assignments : []
          setAssignments(assignmentsList)
        }
      } catch (error) {
        console.error('Error fetching assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed'
      case 'ACTIVE':
        return 'Available'
      case 'EXPIRED':
        return 'Expired'
      default:
        return status
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test History</h1>
          <p className="text-gray-600">View all your test assignments and access tokens.</p>
        </div>
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{assignment.testTitle}</h3>
                    <p className="text-sm text-gray-500">Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Valid until: {new Date(assignment.validUntil).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>{getStatusText(assignment.status)}</span>
                    {assignment.hasResult && assignment.overallBand && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{assignment.overallBand.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Overall Band</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Access Token</h4>
                      <p className="text-sm text-gray-500 mt-1">Use this token to access your test</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono bg-white px-3 py-1 rounded border">{assignment.accessToken}</code>
                      <button onClick={() => navigator.clipboard.writeText(assignment.accessToken)} className="text-blue-600 hover:text-blue-500 text-sm">Copy</button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {assignment.status === 'ACTIVE' && (
                    <Link href={`/test/${assignment.accessToken}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Start Test</Link>
                  )}
                  {assignment.status === 'COMPLETED' && assignment.hasResult && (
                    <Link href={`/results?token=${assignment.accessToken}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">View Results</Link>
                  )}
                  {assignment.status === 'COMPLETED' && !assignment.hasResult && (
                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100">Results Pending</span>
                  )}
                  {assignment.status === 'EXPIRED' && (
                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100">Test Expired</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-12 sm:p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No test assignments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Your instructor will assign tests to you. Check back later.</p>
          </div>
        </div>
      )}
    </div>
  )
}


