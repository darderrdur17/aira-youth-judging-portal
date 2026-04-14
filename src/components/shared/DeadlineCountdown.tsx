'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface DeadlineCountdownProps {
  deadline: string
  className?: string
}

function formatDuration(ms: number) {
  if (ms <= 0) return { label: 'Deadline passed', urgent: true, passed: true }

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return { label: `${days}d ${hours}h ${minutes}m`, urgent: days < 2, passed: false }
  }
  if (hours > 0) {
    return { label: `${hours}h ${minutes}m ${seconds}s`, urgent: true, passed: false }
  }
  return { label: `${minutes}m ${seconds}s`, urgent: true, passed: false }
}

export function DeadlineCountdown({ deadline, className }: DeadlineCountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    formatDuration(new Date(deadline).getTime() - Date.now())
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(formatDuration(new Date(deadline).getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline])

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        remaining.passed
          ? 'text-red-600'
          : remaining.urgent
          ? 'text-amber-600'
          : 'text-gray-600'
      } ${className ?? ''} ${remaining.urgent && !remaining.passed ? 'deadline-pulse' : ''}`}
    >
      <Clock size={12} />
      {remaining.passed ? 'Judging closed' : remaining.label}
    </span>
  )
}
