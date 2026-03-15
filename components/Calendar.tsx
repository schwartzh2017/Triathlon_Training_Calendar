'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, addDays, subDays } from 'date-fns'
import CalendarHeader from './CalendarHeader'
import WorkoutModal from './WorkoutModal'
import { getPhaseForWeek } from '@/config/phases'
import { Workout } from '@/types/workout'
import { SPORT_COLORS, SPORT_LABELS, PHASE_COLORS } from '@/lib/constants'

interface CalendarProps {
  workouts: Workout[]
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar({ workouts }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 13)) // March 13, 2026
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set())
  const [focusedDate, setFocusedDate] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/logs')
      .then(r => r.json())
      .then((dates: string[]) => setLoggedDates(new Set(dates)))
      .catch(() => {})
  }, [])

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [days])

  const workoutMap = useMemo(() => {
    const map = new Map<string, Workout>()
    workouts.forEach(w => map.set(w.date, w))
    return map
  }, [workouts])

  const focusCell = useCallback((dateStr: string) => {
    setFocusedDate(dateStr)
    const cell = gridRef.current?.querySelector<HTMLElement>(`[data-date="${dateStr}"]`)
    cell?.focus()
  }, [])

  const handleDayClick = useCallback((date: Date) => {
    const workout = workoutMap.get(format(date, 'yyyy-MM-dd')) || null
    if (!workout) return
    setSelectedWorkout(workout)
    setIsModalOpen(true)
  }, [workoutMap])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleLogSaved = useCallback((date: string) => {
    setLoggedDates(prev => new Set(prev).add(date))
  }, [])

  const visibleDateSet = useMemo(() => new Set(days.map(d => format(d, 'yyyy-MM-dd'))), [days])

  // Roving tabIndex: only the active cell (or the first cell as fallback) is reachable via Tab.
  const rovingTabDate = focusedDate ?? (days.length > 0 ? format(days[0], 'yyyy-MM-dd') : null)

  const handleGridKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!focusedDate) return

    const current = new Date(focusedDate + 'T00:00:00')
    let next: Date | null = null

    switch (e.key) {
      case 'ArrowRight':
        next = addDays(current, 1)
        break
      case 'ArrowLeft':
        next = subDays(current, 1)
        break
      case 'ArrowDown':
        next = addDays(current, 7)
        break
      case 'ArrowUp':
        next = subDays(current, 7)
        break
      case 'Enter':
      case ' ':
        handleDayClick(current)
        e.preventDefault()
        return
      default:
        return
    }

    if (next) {
      e.preventDefault()
      const nextStr = format(next, 'yyyy-MM-dd')
      if (visibleDateSet.has(nextStr)) {
        focusCell(nextStr)
      }
    }
  }, [focusedDate, focusCell, handleDayClick, visibleDateSet])

  return (
    <div className="max-w-[1100px] mx-auto">
      <CalendarHeader
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
      />

      <div
        ref={gridRef}
        className="flex flex-col"
        role="grid"
        aria-label="Training calendar"
        style={{ fontFamily: "'Tenor Sans', sans-serif" }}
        onKeyDown={handleGridKeyDown}
      >
        {/* Weekday headers must be inside role="grid" to satisfy ARIA ownership */}
        <div
          className="grid grid-cols-7 gap-0"
          role="row"
        >
          {WEEKDAYS.map(day => (
            <div
              key={day}
              role="columnheader"
              className="text-center py-2 text-[var(--text-xs)] uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIdx) => {
          const phase = getPhaseForWeek(week)
          const phaseColor = phase ? PHASE_COLORS[phase.name] : undefined

          return (
            <div
              key={weekIdx}
              role="row"
              style={{
                borderLeft: `5px solid ${phaseColor ?? 'transparent'}`,
                backgroundColor: phaseColor
                  ? `color-mix(in srgb, ${phaseColor} 8%, transparent)`
                  : undefined,
              }}
            >
              {/* role="presentation" lets the CSS grid exist without breaking the row→gridcell ARIA ownership chain */}
              <div role="presentation" className="grid grid-cols-7 gap-px bg-[var(--border)]">
                {week.map((day, dayIdx) => {
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isTodayDate = isToday(day)
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const workout = workoutMap.get(dateStr)
                  const isLogged = loggedDates.has(dateStr)
                  const isRaceDay = dateStr === '2026-05-31'

                  const ariaLabel = [
                    format(day, 'EEEE, MMMM d'),
                    workout ? workout.sports.map(s => SPORT_LABELS[s]).join(', ') : 'Rest day',
                    isLogged ? 'Logged' : '',
                  ].filter(Boolean).join(' — ')

                  return (
                    <div
                      key={day.toISOString()}
                      role="gridcell"
                      tabIndex={dateStr === rovingTabDate ? 0 : -1}
                      data-date={dateStr}
                      aria-label={ariaLabel}
                      aria-selected={focusedDate === dateStr}
                      onClick={() => handleDayClick(day)}
                      onFocus={() => setFocusedDate(dateStr)}
                      className={`
                        calendar-day-cell
                        min-h-[120px] p-[8px_10px] cursor-pointer
                        border-l border-t border-[var(--border)]
                        ${!isCurrentMonth ? 'bg-[var(--bg-secondary)] opacity-50' : 'bg-[var(--bg-card)]'}
                        ${isTodayDate ? 'border-l-[3px] border-l-[var(--accent-primary)]' : ''}
                        hover:border-[var(--border-strong)] hover:shadow-md
                        focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-inset
                      `}
                      style={{ transition: 'box-shadow 150ms ease, border-color 150ms ease' }}
                    >
                      <span
                        className={`
                          text-[var(--text-sm)]
                          ${isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
                        `}
                        style={{ fontFamily: "'Tenor Sans', sans-serif", display: 'block' }}
                      >
                        {format(day, 'd')}
                        {isLogged && <span className="logged-indicator" aria-hidden="true" />}
                      </span>
                      {workout && workout.sports.length > 0 && (
                        <div className="mt-1" aria-hidden="true">
                          {workout.sports.map(sport => (
                            <span
                              key={sport}
                              className="calendar-sport-pill inline-flex items-center rounded-[2px] px-[7px] py-[2px] text-xs"
                              style={{
                                backgroundColor: SPORT_COLORS[sport],
                                color: 'var(--text-on-badge)',
                                fontFamily: "'Libre Baskerville', serif",
                                fontSize: 'var(--text-xs)',
                                margin: '2px 2px 0 0',
                              }}
                            >
                              {SPORT_LABELS[sport]}
                            </span>
                          ))}
                        </div>
                      )}
                      {isRaceDay && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontFamily: "'Tenor Sans', sans-serif",
                            fontSize: 'var(--text-base)',
                            color: 'var(--accent-primary)',
                            fontWeight: 'bold',
                            lineHeight: 1.2,
                          }}
                          aria-label="Race Day"
                        >
                          RACE DAY 🎉
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <WorkoutModal
        workout={selectedWorkout}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLogSaved={handleLogSaved}
      />
    </div>
  )
}
