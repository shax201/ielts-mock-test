'use client'

import { useState } from 'react'

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: data.message })
      } else {
        setResult({ type: 'error', message: data.error })
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Email Configuration Test
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Test your email configuration and send sample assignment notifications.
          </p>
        </div>
      </div>

      {/* Email Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Email Configuration Required</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Make sure you have configured the following environment variables:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li><code className="bg-blue-100 px-1 rounded">SMTP_HOST</code> - Your SMTP server (e.g., smtp.gmail.com)</li>
                <li><code className="bg-blue-100 px-1 rounded">SMTP_PORT</code> - SMTP port (usually 587)</li>
                <li><code className="bg-blue-100 px-1 rounded">SMTP_USER</code> - Your email address</li>
                <li><code className="bg-blue-100 px-1 rounded">SMTP_PASS</code> - Your email password or app password</li>
                <li><code className="bg-blue-100 px-1 rounded">NEXTAUTH_URL</code> - Your application URL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Test Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Send Test Email
          </h3>
          
          <form onSubmit={handleTestEmail} className="space-y-4">
            <div>
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700">
                Test Email Address
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter email address to send test to"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This will send a sample assignment notification email.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-md ${
              result.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {result.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    result.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.type === 'success' ? 'Success' : 'Error'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    result.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Template Preview */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Email Template Preview
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <p><strong>Subject:</strong> New Mock Test Assignment: [Mock Test Title]</p>
              <p><strong>Recipient:</strong> Student's email address</p>
              <p><strong>Content includes:</strong></p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Personalized greeting with student name</li>
                <li>Mock test title and description</li>
                <li>Assignment expiration date</li>
                <li>Direct link to start the test</li>
                <li>Test instructions and tips</li>
                <li>Professional HTML formatting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
