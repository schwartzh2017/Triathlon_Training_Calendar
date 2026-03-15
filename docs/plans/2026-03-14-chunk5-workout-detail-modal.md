# Chunk 5 — Workout Detail Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a modal that opens when clicking a day cell, displaying full workout details including date, phase, sports, title, and rendered markdown body.

**Architecture:** WorkoutModal component with overlay, click-outside-to-close, ESC key handler, and fade/slide animations. Calendar manages modal state and passes selected workout to modal.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, CSS variables, date-fns

---

## Context to Include in Brief

- **types/workout.ts** — Already defined in Chunk 1
- **frontend-design-triathlon.md** — Modal Design section (lines 235-264)
- **components/Calendar.tsx** — Existing from Chunk 2, will add click handler
- **lib/workouts.ts** — Returns `Workout[]` with `body` as rendered HTML

---

## Pre-requisites

Ensure the following files exist (from Chunks 1-4):
- `types/workout.ts` — Type definitions
- `app/api/workouts/route.ts` — API endpoint
- `app/globals.css` — CSS variables
- `app/layout.tsx` — Root layout with fonts
- `app/page.tsx` — Main page
- `components/Calendar.tsx` — Calendar grid component
- `components/CalendarHeader.tsx` — Header with navigation
- Sample files in `/workouts/`

Verify app builds:
```bash
npm run build
```

---

### Task 1: Create WorkoutModal Component

**Files:**
- Create: `components/WorkoutModal.tsx`

**Step 1: Write the WorkoutModal component**

```typescript
'use client'

import { useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Workout, Sport, Phase } from '@/types/workout'

interface WorkoutModalProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
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

export default function WorkoutModal({ workout, isOpen, onClose }: WorkoutModalProps) {
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
        className="bg-[var(--bg-card)] border rounded-[2px] shadow-lg"
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
          {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
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
```

**Step 2: Commit**
```bash
git add components/WorkoutModal.tsx
git commit -m "feat: add WorkoutModal component with overlay and animations"
```

---

### Task 2: Integrate Modal into Calendar

**Files:**
- Modify: `components/Calendar.tsx:1-99`

**Step 1: Add import for WorkoutModal and state**

Replace the imports at the top of Calendar.tsx:

```typescript
'use client'

import { useState, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'
import CalendarHeader from './CalendarHeader'
import WorkoutModal from './WorkoutModal'
import { Workout } from '@/types/workout'
```

**Step 2: Add modal state and handlers**

Add after the `workoutMap` useMemo in Calendar.tsx:

```typescript
const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
const [isModalOpen, setIsModalOpen] = useState(false)

const handleDayClick = useCallback((date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd')
  const workout = workoutMap.get(dateStr) || null
  setSelectedWorkout(workout)
  setIsModalOpen(true)
}, [workoutMap])

const handleCloseModal = useCallback(() => {
  setIsModalOpen(false)
}, [])
```

**Step 3: Update day cell rendering to be clickable and show sport pills**

Replace the day cell rendering section (lines 66-93):

```typescript
{week.map(day => {
  const isCurrentMonth = isSameMonth(day, currentDate)
  const isTodayDate = isToday(day)
  const workout = workoutMap.get(format(day, 'yyyy-MM-dd')) || null

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
            const colors: Record<string, { light: string; dark: string }> = {
              swim: { light: '#2E6B9E', dark: '#5A9EC8' },
              bike: { light: '#C47A2A', dark: '#D4944A' },
              run: { light: '#3A7D52', dark: '#5A9E72' },
              strength: { light: '#7A4F8A', dark: '#9A6FAA' },
            }
            const labels: Record<string, string> = {
              swim: 'Swim',
              bike: 'Bike',
              run: 'Run',
              strength: 'Strength',
            }
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
            const bgColor = isDark ? colors[sport].dark : colors[sport].light

            return (
              <span
                key={sport}
                className="inline-flex items-center rounded-[2px] px-[7px] py-[2px] text-xs"
                style={{
                  backgroundColor: bgColor,
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
```

**Step 4: Add WorkoutModal to Calendar return JSX**

Add after the closing `</div>` of the calendar grid (before the final `</div>`):

```tsx
<WorkoutModal
  workout={selectedWorkout}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
/>
```

**Step 5: Run TypeScript check**

```bash
npm run build
```

Expected: Build completes without errors

**Step 6: Commit**
```bash
git add components/Calendar.tsx
git commit -m "feat: integrate WorkoutModal into Calendar with click handler"
```

---

### Task 3: Verify Implementation

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Verify modal opens on day click**

Navigate to `http://localhost:3000` and verify:
- Click on a day with a workout (e.g., March 13, 2026) — modal should open
- Modal shows: date line, phase badge, sport pills, title, divider, rendered body
- Modal animates in with fade + slide

**Step 3: Verify modal closes correctly**

- Click outside modal (on overlay) — modal closes
- Press ESC key — modal closes
- Click × button — modal closes

**Step 4: Verify rest day behavior**

- Click on a day without a workout (rest day) — modal should NOT open, or show empty state

**Step 5: Verify rendered markdown**

- Check that lists, headers, bold, italic all render correctly
- Check that code blocks use JetBrains Mono
- Check italic Libre Baskerville on `<em>` elements

**Step 6: Verify dark mode**

- Toggle dark mode, verify modal colors adapt correctly

**Step 7: Commit final**

```bash
git add .
git commit -m "feat: complete chunk 5 - workout detail modal"
```

---

## Files Produced

```
components/
  WorkoutModal.tsx    (new)
components/
  Calendar.tsx        (modified - add click handler and modal integration)
```

---

## Success Criteria

- [ ] Modal opens when clicking a day cell with a workout
- [ ] Modal closes on overlay click, ESC key, and × button
- [ ] Date line shows formatted date in Tenor Sans, uppercase tracked
- [ ] Phase badge shows correct phase color
- [ ] Sport badges show correct sport colors
- [ ] Title renders in Tenor Sans at --text-lg
- [ ] Divider uses var(--border)
- [ ] Body renders markdown HTML with correct fonts
- [ ] Code blocks use JetBrains Mono
- [ ] Italic Libre Baskerville on em elements
- [ ] Open animation: fade-in + translateY(8px → 0), 200ms ease-out
- [ ] Close animation: fade-out, 150ms ease-in
- [ ] No TypeScript errors
- [ ] Build passes
