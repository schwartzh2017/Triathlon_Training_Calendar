'use client'

import { useState, useEffect, useRef } from 'react'
import { Workout, WorkoutLog } from '@/types/workout'
import { LOG_STATUSES } from '@/lib/constants'
import { formatCoachUpdate } from '@/lib/formatCoachUpdate'

interface WorkoutLoggerProps {
  date: string
  workout: Workout
  onLogSaved?: (date: string) => void
}

type LogStatus = WorkoutLog['status']
type SaveState = 'idle' | 'saving' | 'saved'

const STATUS_LABELS: Record<LogStatus, string> = {
  completed: 'Completed',
  modified: 'Modified',
  skipped: 'Skipped',
}

export default function WorkoutLogger({ date, workout, onLogSaved }: WorkoutLoggerProps) {
  const [status, setStatus] = useState<LogStatus>('completed')
  const [rpe, setRpe] = useState(5)
  const [actualDuration, setActualDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [copied, setCopied] = useState(false)
  const [logData, setLogData] = useState<WorkoutLog | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadLog() {
      try {
        const res = await fetch(`/api/log?date=${date}`, { signal: controller.signal })
        if (res.ok) {
          const log: WorkoutLog | null = await res.json()
          if (log) {
            setStatus(log.status)
            setRpe(log.rpe)
            setActualDuration(log.actualDuration || '')
            setNotes(log.notes || '')
            setLogData(log)
          }
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Failed to load log', e)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadLog()
    return () => controller.abort()
  }, [date])

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  async function handleSave() {
    setSaveState('saving')
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          status,
          rpe,
          actualDuration: actualDuration || null,
          notes: notes || null,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        setLogData(saved)
        setSaveState('saved')
        onLogSaved?.(date)
        savedTimerRef.current = setTimeout(() => setSaveState('idle'), 2000)
      } else {
        setSaveState('idle')
      }
    } catch (e) {
      console.error('Failed to save log', e)
      setSaveState('idle')
    }
  }

  const handleCopyCoachUpdate = async () => {
    if (!logData) return

    try {
      const formatted = formatCoachUpdate(workout, logData)
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy to clipboard', e)
    }
  }

  if (loading) {
    return <div className="workout-logger">Loading...</div>
  }

  return (
    <div className="workout-logger">
      <span className="logger-label">Log Your Workout</span>

      <div className="status-toggle">
        <label className="field-label">Status</label>
        <div className="toggle-buttons">
          {LOG_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`status-btn ${status === s ? 'active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rpe-slider">
        <label className="field-label">
          RPE: <span className="rpe-value">{rpe}/10</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="range-input"
        />
        <div className="rpe-labels">
          <span>Easy</span>
          <span>Max</span>
        </div>
      </div>

      <div className="duration-input">
        <label className="field-label">Actual Duration</label>
        <input
          type="text"
          value={actualDuration}
          onChange={(e) => setActualDuration(e.target.value)}
          placeholder="e.g. 1h 15min"
          className="text-input"
        />
      </div>

      <div className="notes-input">
        <label className="field-label">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel? Any observations?"
          className="textarea-input"
          rows={3}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="save-btn"
      >
        {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save Log'}
      </button>

      {logData && (
        <button
          type="button"
          onClick={handleCopyCoachUpdate}
          className="copy-coach-btn"
        >
          {copied ? 'Copied!' : 'Copy Coach Update'}
        </button>
      )}
    </div>
  )
}
