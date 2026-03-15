'use client'

import { useState, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'
import CalendarHeader from './CalendarHeader'
import PhaseBanner from './PhaseBanner'
import WorkoutModal from './WorkoutModal'
import { getPhaseForWeek } from '@/config/phases'
import { Workout } from '@/types/workout'

interface CalendarProps {
  workouts: Workout[]
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar({ workouts }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 13)) // March 13, 2026

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

  function getWorkoutForDate(date: Date): Workout | undefined {
    const dateStr = format(date, 'yyyy-MM-dd')
    return workouts.find(w => w.date === dateStr)
  }

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDayClick = useCallback((date: Date) => {
    const workout = getWorkoutForDate(date) || null
    setSelectedWorkout(workout)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
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

      <div className="grid grid-cols-7 gap-px bg-[var(--border)]">
        {weeks.map((week, weekIdx) => {
          const phase = getPhaseForWeek(week)
          
          return (
            <div 
              key={weekIdx}
              className="contents relative"
            >
              {week.map(day => {
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isTodayDate = isToday(day)
                const workout = getWorkoutForDate(day)
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`
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
                    </span>
                    
                    {workout && workout.sports.length > 0 && (
                      <div className="mt-1">
                        {workout.sports.map(sport => {
                          const sportColorVars: Record<string, string> = {
                            swim: 'var(--sport-swim)',
                            bike: 'var(--sport-bike)',
                            run: 'var(--sport-run)',
                            strength: 'var(--sport-strength)',
                          }
                          const labels: Record<string, string> = {
                            swim: 'Swim',
                            bike: 'Bike',
                            run: 'Run',
                            strength: 'Strength',
                          }

                          return (
                            <span
                              key={sport}
                              className="inline-flex items-center rounded-[2px] px-[7px] py-[2px] text-xs"
                              style={{
                                backgroundColor: sportColorVars[sport],
                                color: '#FAF9F6',
                                fontFamily: "'Libre Baskerville', serif",
                                fontSize: 'var(--text-xs)',
                                margin: '2px 2px 0 0',
                              }}
                            >
                              {labels[sport]}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {/* PhaseBanner overlays the entire week row */}
              <div className="absolute inset-0 -z-10">
                <PhaseBanner phase={phase} />
              </div>
            </div>
          )
        })}
      </div>
      <WorkoutModal
        workout={selectedWorkout}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
