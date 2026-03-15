'use client'

import { useState, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'
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

  return (
    <div className="max-w-[1100px] mx-auto">
      <CalendarHeader
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
      />

      <div
        className="grid grid-cols-7 gap-0"
        style={{ fontFamily: "'Tenor Sans', sans-serif" }}
      >
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center py-2 text-[var(--text-xs)] uppercase tracking-[0.08em] text-[var(--text-muted)]"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        {weeks.map((week, weekIdx) => {
          const phase = getPhaseForWeek(week)
          const phaseColor = phase ? PHASE_COLORS[phase.name] : undefined

          return (
            <div
              key={weekIdx}
              style={{
                borderLeft: `5px solid ${phaseColor ?? 'transparent'}`,
                backgroundColor: phaseColor
                  ? `color-mix(in srgb, ${phaseColor} 8%, transparent)`
                  : undefined,
              }}
            >
              <div className="grid grid-cols-7 gap-px bg-[var(--border)]">
                {week.map((day, dayIdx) => {
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isTodayDate = isToday(day)
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const workout = workoutMap.get(dateStr)
                  const isMonday = dayIdx === 0
                  const isLogged = loggedDates.has(dateStr)

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        calendar-day-cell
                        min-h-[120px] p-[8px_10px] cursor-pointer
                        border-l border-t border-[var(--border)]
                        ${!isCurrentMonth ? 'bg-[var(--bg-secondary)] opacity-50' : 'bg-[var(--bg-card)]'}
                        ${isTodayDate ? 'border-l-[3px] border-l-[var(--accent-primary)]' : ''}
                        hover:border-[var(--border-strong)] hover:shadow-md
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
                        {isLogged && <span className="logged-indicator" />}
                      </span>
                      {isMonday && phase && phaseColor && (
                        <span
                          style={{
                            display: 'block',
                            marginTop: '6px',
                            fontSize: 'var(--text-xs)',
                            fontFamily: "'Tenor Sans', sans-serif",
                            color: phaseColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.10em',
                          }}
                        >
                          {phase.label}
                        </span>
                      )}
                      {workout && workout.sports.length > 0 && (
                        <div className="mt-1">
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
