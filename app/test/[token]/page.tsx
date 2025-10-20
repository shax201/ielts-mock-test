'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TokenEntryPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const validateAndRedirect = async () => {
      try {
        const { token } = await params
        const response = await fetch(`/api/student/validate-token?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (response.ok) {
          router.replace(`/test/${token}/instructions`)
        } else {
          setError(data?.error || 'Invalid or expired token')
        }
      } catch (_err) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    validateAndRedirect()
  }, [params, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8" />
            </svg>
          </div>
          <p className="mt-4 text-gray-700">Validating your access token…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Unable to start test</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/test')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Test Entry
          </button>
        </div>
      </div>
    )
  }

  return null
}


