'use client'

import { useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Workout } from '@/types/workout'
import { SPORT_COLORS, SPORT_LABELS, PHASE_COLORS, PHASE_LABELS } from '@/lib/constants'
import WorkoutLogger from './WorkoutLogger'

interface WorkoutModalProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onLogSaved?: (date: string) => void
}

export default function WorkoutModal({ workout, isOpen, onClose, onLogSaved }: WorkoutModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !workout) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'var(--overlay-bg)',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 150ms ease-in',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative bg-[var(--bg-card)] border rounded-[2px] shadow-lg"
        style={{
          borderColor: 'var(--border-strong)',
          boxShadow: '4px 8px 32px var(--shadow-strong)',
          maxWidth: '560px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px 36px',
          animation: 'slideIn 200ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-modal-title"
      >
        {/* Date line */}
        <div
          className="uppercase tracking-[0.08em] mb-3"
          style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
          }}
        >
          {format(new Date(workout.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
        </div>

        {/* Phase badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block px-2 py-1 rounded-[2px] text-xs"
            style={{
              backgroundColor: PHASE_COLORS[workout.phase],
              color: 'var(--text-on-badge)',
              fontFamily: "'Tenor Sans', sans-serif",
            }}
          >
            {PHASE_LABELS[workout.phase]}
          </span>
        </div>

        {/* Sport badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {workout.sports.map(sport => (
            <span
              key={sport}
              className="inline-flex items-center rounded-[2px] px-2 py-1 text-xs"
              style={{
                backgroundColor: SPORT_COLORS[sport],
                color: 'var(--text-on-badge)',
                fontFamily: "'Libre Baskerville', serif",
              }}
            >
              {SPORT_LABELS[sport]}
            </span>
          ))}
        </div>

        {/* Workout title */}
        <h2
          id="workout-modal-title"
          className="mb-4"
          style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: 'var(--text-lg)',
            color: 'var(--text-primary)',
          }}
        >
          {workout.title}
        </h2>

        {/* Divider */}
        <div
          className="h-px w-full mb-4"
          style={{ backgroundColor: 'var(--border)' }}
        />

        {/* Workout body - rendered HTML */}
        <div
          className="prose prose-sm"
          style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'var(--text-base)',
            lineHeight: 1.75,
            color: 'var(--text-primary)',
          }}
          dangerouslySetInnerHTML={{ __html: workout.body }}
        />

        {/* Workout Logger */}
        <WorkoutLogger date={workout.date} workout={workout} onLogSaved={onLogSaved} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-secondary)] rounded"
          aria-label="Close modal"
          style={{ fontFamily: "'Tenor Sans', sans-serif" }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
