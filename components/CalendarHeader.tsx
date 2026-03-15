'use client'

import { useState, useEffect } from 'react'

interface CalendarHeaderProps {
  currentDate: Date
  onMonthChange: (date: Date) => void
}

export default function CalendarHeader({ currentDate, onMonthChange }: CalendarHeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      // Reading localStorage on mount is the correct pattern here — localStorage is
      // not available during SSR, so this effect is the only safe place to sync state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme('dark')
      // Ensure the DOM attribute matches React state from the first render.
      // The layout inline script sets this before paint, but React state
      // initialises as 'light', so the toggle icon would flash wrong without this.
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <h1 
        className="text-[var(--text-3xl)]" 
        style={{ fontFamily: "'Tenor Sans', sans-serif" }}
      >
        Triathlon Training
      </h1>
      
      <div 
        className="flex items-center gap-4"
        style={{ fontFamily: "'Tenor Sans', sans-serif" }}
      >
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-[var(--bg-secondary)] rounded"
          aria-label="Previous month"
        >
          ←
        </button>
        
        <span className="text-[var(--text-2xl)] min-w-[180px] text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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
        style={{ fontFamily: "'Tenor Sans', sans-serif" }}
      >
        {theme === 'light' ? '☾' : '☀'}
      </button>
    </header>
  )
}
