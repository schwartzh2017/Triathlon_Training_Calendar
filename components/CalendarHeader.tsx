'use client'

import { useState, useEffect } from 'react'
import { isSameMonth } from 'date-fns'

interface CalendarHeaderProps {
  currentDate: Date
  onMonthChange: (date: Date) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const TODAY = new Date()

export default function CalendarHeader({ currentDate, onMonthChange }: CalendarHeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const prevMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() - 1)
    onMonthChange(d)
  }

  const nextMonth = () => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + 1)
    onMonthChange(d)
  }

  const goToToday = () => {
    onMonthChange(new Date(TODAY))
  }

  const isOnTodayMonth = isSameMonth(currentDate, TODAY)

  return (
    <header className="mb-8" style={{ fontFamily: "'Tenor Sans', sans-serif" }}>
      {/* Row 1: App title */}
      <h1
        style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: '2.5rem',
          color: 'var(--text-primary)',
          marginBottom: '12px',
          lineHeight: 1.1,
        }}
      >
        PDX Triathlon: May 31, 2026
      </h1>

      {/* Row 2: Nav controls */}
      <div className="flex items-center gap-3">
        {/* Today button — only shown when not on today's month */}
        {!isOnTodayMonth && (
          <button
            onClick={goToToday}
            style={{
              fontFamily: "'Tenor Sans', sans-serif",
              fontSize: 'var(--text-sm)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '2px',
              padding: '4px 12px',
              background: 'transparent',
              cursor: 'pointer',
            }}
            aria-label="Go to today"
          >
            Today
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded"
            aria-label="Previous month"
          >
            ←
          </button>

          <span
            style={{
              fontSize: 'var(--text-2xl)',
              minWidth: '180px',
              textAlign: 'center',
            }}
          >
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-[var(--bg-secondary)] rounded"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? '☾' : '☀'}
        </button>
      </div>
    </header>
  )
}
