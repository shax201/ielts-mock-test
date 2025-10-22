'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  email: string
  name: string
}

export default function StudentProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeAssignments, setActiveAssignments] = useState<Array<{ id: string; title: string; token: string; validUntil?: string }>>([])
  const [isTestsOpen, setIsTestsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/student/auth/me')
        if (response.ok) {
          const data = await response.json()
          setStudent(data.student)
        } else {
          router.push('/student/login')
        }
      } catch (error) {
        router.push('/student/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await fetch('/api/student/assignments')
        if (res.ok) {
          const data = await res.json()
          // Ensure data.assignments is an array before processing
          const assignmentsList = Array.isArray(data.assignments) ? data.assignments : []
          const list = assignmentsList
            .filter((a: any) => a && typeof a === 'object' && a.status === 'ACTIVE')
            .map((a: any) => ({ 
              id: a.id, 
              title: a.testTitle, 
              token: a.accessToken,
              validUntil: a.validUntil 
            }))
          setActiveAssignments(list)
        }
      } catch (error) {
        console.error('Error loading assignments:', error)
      }
    }
    loadAssignments()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isTestsOpen) {
        const target = event.target as Element
        if (!target.closest('.relative')) {
          setIsTestsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTestsOpen])

  const handleLogout = async () => {
    try {
      await fetch('/api/student/auth/logout', { method: 'POST' })
      router.push('/student/login')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!student) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/student" className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">IELTS Student Portal</h1>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link href="/student" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/student' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Dashboard</Link>
                <Link href="/student/results" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname?.startsWith('/student/results') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>My Results</Link>
                <Link href="/student/tests" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname?.startsWith('/student/tests') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Test History</Link>
                {/* Start Test dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsTestsOpen(v => !v)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsTestsOpen(v => !v)
                      }
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-expanded={isTestsOpen}
                    aria-haspopup="true"
                  >
                    Start Test
                    <span className="ml-1">▾</span>
                  </button>
                  {isTestsOpen && (
                    <div className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" role="menu">
                      <div className="py-1 max-h-80 overflow-auto">
                        {activeAssignments.length > 0 ? (
                          activeAssignments.map((item, index) => {
                            // Safety check for item object
                            if (!item || typeof item !== 'object' || !item.id) {
                              return null
                            }
                            return (
                              <Link
                                key={item.id || index}
                                href={`/test/${item.token || ''}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsTestsOpen(false)}
                              >
                                {item.title || 'Untitled Test'}
                              </Link>
                            )
                          })
                        ) : (
                          <span className="block px-4 py-2 text-sm text-gray-400">No active tests</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {student.name}</span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}


