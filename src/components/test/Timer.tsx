'use client'

import { useState, useEffect } from 'react'

interface TimerProps {
  timeRemaining: number
  onTimeUp: () => void
}

export default function Timer({ timeRemaining, onTimeUp }: TimerProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    setDisplayTime(timeRemaining)
    setIsWarning(timeRemaining <= 5 * 60) // Warning when 5 minutes or less
  }, [timeRemaining])

  useEffect(() => {
    if (displayTime <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setDisplayTime(prev => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [displayTime, onTimeUp])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
      isWarning ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
    }`}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-mono text-lg font-semibold">
        {formatTime(displayTime)}
      </span>
      {isWarning && (
        <span className="text-sm font-medium animate-pulse">
          Time Warning!
        </span>
      )}
    </div>
  )
}
