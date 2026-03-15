'use client'

import { useState, useEffect } from 'react'
import { Workout, WorkoutLog } from '@/types/workout'
import { formatCoachUpdate, capitalizeFirstLetter } from '@/lib/formatCoachUpdate'

interface WorkoutLoggerProps {
  date: string
  workout: Workout
  onLogSaved?: () => void
}

type LogStatus = 'completed' | 'modified' | 'skipped'

export default function WorkoutLogger({ date, workout, onLogSaved }: WorkoutLoggerProps) {
  const [status, setStatus] = useState<LogStatus>('completed')
  const [rpe, setRpe] = useState(5)
  const [actualDuration, setActualDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [logData, setLogData] = useState<WorkoutLog | null>(null)

  useEffect(() => {
    async function loadLog() {
      try {
        const res = await fetch(`/api/log?date=${date}`)
        if (res.ok) {
          const log = await res.json()
          if (log) {
            setStatus(log.status)
            setRpe(log.rpe)
            setActualDuration(log.actualDuration || '')
            setNotes(log.notes || '')
            setLogData(log)
          }
        }
      } catch (e) {
        console.error('Failed to load log', e)
      } finally {
        setLoading(false)
      }
    }
    loadLog()
  }, [date])

  async function handleSave() {
    setSaving(true)
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
        setSaved(true)
        onLogSaved?.()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (e) {
      console.error('Failed to save log', e)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyCoachUpdate = async () => {
    if (!logData) return

    const formatted = formatCoachUpdate(workout, logData)
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="logger-skeleton">Loading...</div>
  }

  return (
    <div className="workout-logger">
      <div className="logger-header">
        <span className="logger-label">Log Your Workout</span>
      </div>

      <div className="status-toggle">
        <label className="field-label">Status</label>
        <div className="toggle-buttons">
          {(['completed', 'modified', 'skipped'] as LogStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`status-btn ${status === s ? 'active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {capitalizeFirstLetter(s)}
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
        disabled={saving}
        className="save-btn"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Log'}
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
