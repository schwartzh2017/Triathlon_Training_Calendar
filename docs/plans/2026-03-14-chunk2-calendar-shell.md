# Chunk 2: Calendar Shell & Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the app skeleton with correct visual structure — 7-column calendar grid, month navigation, dark mode toggle, and empty day cells. No workout data rendered yet.

**Architecture:** Next.js App Router with client-side calendar state management. CSS variables handle theming globally. Date utilities from date-fns for calendar math.

**Tech Stack:** Next.js 14, TypeScript, Tailwind (utility classes only), date-fns

---

## Context to Include in Brief

- **types/workout.ts** — Already defined in Chunk 1
- **frontend-design-triathlon.md** — Full design system (colors, typography, spacing, motion)
- Sample workout files exist in `/workouts/` directory

---

## Pre-requisites

Ensure the following files exist (from Chunk 1):
- `types/workout.ts`
- `app/api/workouts/route.ts`
- Sample files in `/workouts/`

Verify API works:
```bash
curl http://localhost:3000/api/workouts
```

---

### Task 1: Define Global CSS Variables

**Files:**
- Create: `app/globals.css`

**Step 1: Write CSS variables from design system**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Light Mode (default) */
  --bg-primary: #F4F1EC;
  --bg-secondary: #ECEAE3;
  --bg-card: #FAF9F6;
  --text-primary: #1E1C19;
  --text-secondary: #4A4540;
  --text-muted: #8A8178;

  --sport-swim: #2E6B9E;
  --sport-bike: #C47A2A;
  --sport-run: #3A7D52;
  --sport-strength: #7A4F8A;

  --phase-base: #D4C9B0;
  --phase-race-prep: #C4845A;
  --phase-taper: #7A9E7E;

  --accent-primary: #2E6B9E;
  --accent-warm: #C47A2A;
  --border: #D6D0C4;
  --border-strong: #B0A898;
  --shadow: rgba(30, 28, 25, 0.10);
  --shadow-strong: rgba(30, 28, 25, 0.20);

  --text-xs: 0.70rem;
  --text-sm: 0.825rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
}

[data-theme="dark"] {
  --bg-primary: #181613;
  --bg-secondary: #201E1A;
  --bg-card: #272420;
  --text-primary: #EDE8DF;
  --text-secondary: #B8B0A0;
  --text-muted: #7A7268;

  --sport-swim: #5A9EC8;
  --sport-bike: #D4944A;
  --sport-run: #5A9E72;
  --sport-strength: #9A6FAA;

  --phase-base: #3A3428;
  --phase-race-prep: #7A4830;
  --phase-taper: #3A5A3E;

  --accent-primary: #5A9EC8;
  --accent-warm: #D4944A;
  --border: #3A3530;
  --border-strong: #504840;
  --shadow: rgba(0, 0, 0, 0.35);
  --shadow-strong: rgba(0, 0, 0, 0.55);
}

* {
  transition: background-color 250ms ease, color 250ms ease, border-color 150ms ease;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Libre Baskerville', serif;
}
```

**Step 2: Commit**
```bash
git add app/globals.css
git commit -m "feat: add CSS variables for light/dark themes"
```

---

### Task 2: Create Root Layout with Fonts and Theme Support

**Files:**
- Create: `app/layout.tsx`

**Step 1: Write layout with Google Fonts**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Triathlon Training Calendar',
  description: 'Training calendar for triathlon workouts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

**Step 2: Commit**
```bash
git add app/layout.tsx
git commit -m "feat: add root layout with fonts and theme init"
```

---

### Task 3: Create Calendar Header Component

**Files:**
- Create: `components/CalendarHeader.tsx`

**Step 1: Write CalendarHeader component**

```typescript
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
      setTheme('dark')
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
```

**Step 2: Commit**
```bash
git add components/CalendarHeader.tsx
git commit -m "feat: add CalendarHeader with month nav and dark mode toggle"
```

---

### Task 4: Create Calendar Component with Grid

**Files:**
- Create: `components/Calendar.tsx`

**Step 1: Write Calendar component**

```typescript
'use client'

import { useState, useMemo } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'
import CalendarHeader from './CalendarHeader'
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

  const getWorkoutForDate = (date: Date): Workout | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return workouts.find(w => w.date === dateStr)
  }

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
        {weeks.map((week, weekIdx) => (
          <div 
            key={weekIdx}
            className="contents"
          >
            {week.map(day => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isTodayDate = isToday(day)
              const workout = getWorkoutForDate(day)
              
              return (
                <div
                  key={day.toISOString()}
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
                    style={{ fontFamily: "'Tenor Sans', sans-serif" }}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add components/Calendar.tsx
git commit -m "feat: add Calendar with month grid and navigation"
```

---

### Task 5: Create Main Page

**Files:**
- Create: `app/page.tsx`

**Step 1: Write page component**

```typescript
import Calendar from '@/components/Calendar'
import { Workout } from '@/types/workout'

async function getWorkouts(): Promise<Workout[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/workouts`, {
      cache: 'no-store'
    })
    if (!res.ok) {
      throw new Error('Failed to fetch workouts')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return []
  }
}

export default async function Home() {
  const workouts = await getWorkouts()

  return (
    <main className="min-h-screen p-8">
      <Calendar workouts={workouts} />
    </main>
  )
}
```

**Step 2: Commit**
```bash
git add app/page.tsx
git commit -m "feat: add main page with calendar and workout data"
```

---

### Task 6: Verify Build and Test

**Step 1: Run TypeScript check**

```bash
npm run build
```

Expected: Build completes without TypeScript errors

**Step 2: Start dev server and verify calendar**

```bash
npm run dev
```

Navigate to `http://localhost:3000` and verify:
- Calendar grid renders with correct month (March 2026)
- Month navigation (← →) works
- Dark mode toggle works and persists
- Today's date (March 13, 2026) shows left border accent
- Empty day cells render with correct styling

**Step 3: Commit final**
```bash
git add .
git commit -m "feat: complete chunk 2 - calendar shell and layout"
```

---

## Files Produced

```
app/
  layout.tsx        (new)
  globals.css       (new)
  page.tsx          (new)
components/
  Calendar.tsx      (new)
  CalendarHeader.tsx (new)
```

---

## Success Criteria

- [ ] Calendar renders correct month grid for March–May 2026
- [ ] Month navigation works (← →)
- [ ] Dark mode toggle switches theme smoothly
- [ ] All colors, fonts, spacing from design system — no hardcoded values
- [ ] No workout data rendered — just structural shell
- [ ] No TypeScript errors
- [ ] Build passes
