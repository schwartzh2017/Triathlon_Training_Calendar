'use client'

import { useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Workout, Sport, Phase } from '@/types/workout'
import WorkoutLogger from './WorkoutLogger'

interface WorkoutModalProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onLogSaved?: (date: string) => void
}

const sportColors: Record<Sport, string> = {
  swim: 'var(--sport-swim)',
  bike: 'var(--sport-bike)',
  run: 'var(--sport-run)',
  strength: 'var(--sport-strength)',
}

const phaseColors: Record<Phase, string> = {
  base: 'var(--phase-base)',
  'race-prep': 'var(--phase-race-prep)',
  taper: 'var(--phase-taper)',
}

const sportLabels: Record<Sport, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
  strength: 'Strength',
}

const phaseLabels: Record<Phase, string> = {
  base: 'Base',
  'race-prep': 'Race Prep',
  taper: 'Taper',
}

export default function WorkoutModal({ workout, isOpen, onClose, onLogSaved }: WorkoutModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !workout) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(30, 28, 25, 0.55)',
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
              backgroundColor: phaseColors[workout.phase],
              color: '#FAF9F6',
              fontFamily: "'Tenor Sans', sans-serif",
            }}
          >
            {phaseLabels[workout.phase]}
          </span>
        </div>

        {/* Sport badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {workout.sports.map(sport => (
            <span
              key={sport}
              className="inline-flex items-center rounded-[2px] px-2 py-1 text-xs"
              style={{
                backgroundColor: sportColors[sport],
                color: '#FAF9F6',
                fontFamily: "'Libre Baskerville', serif",
              }}
            >
              {sportLabels[sport]}
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
        <WorkoutLogger 
          date={workout.date} 
          workout={workout}
          onLogSaved={() => {
            onLogSaved?.(workout.date)
          }} 
        />

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

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .prose h2 {
          font-family: 'Tenor Sans', sans-serif;
          font-size: var(--text-base);
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: var(--text-primary);
        }
        .prose h3 {
          font-family: 'Tenor Sans', sans-serif;
          font-size: var(--text-sm);
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: var(--text-secondary);
        }
        .prose ul {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .prose li {
          margin-bottom: 0.25em;
        }
        .prose em {
          font-style: italic;
          color: var(--text-secondary);
        }
        .prose code {
          font-family: 'JetBrains Mono', monospace;
          font-size: var(--text-sm);
          background: var(--bg-secondary);
          padding: 2px 4px;
          border-radius: 2px;
        }
        .prose pre {
          font-family: 'JetBrains Mono', monospace;
          font-size: var(--text-sm);
          background: var(--bg-secondary);
          padding: 12px;
          border-radius: 2px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .prose pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
