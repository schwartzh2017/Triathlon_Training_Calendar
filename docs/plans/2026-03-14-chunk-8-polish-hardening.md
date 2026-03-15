# Chunk 8 — Polish & Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Production-ready feel with no rough edges — loading states, empty states, error boundaries, responsive layout, dark mode audit, accessibility, and code-simplifier pass.

**Architecture:** Each task is a discrete, testable unit. Loading states use pure CSS animations. Error boundaries wrap Calendar at the page level. Accessibility uses native HTML attributes and keyboard handlers. Dark mode audit verifies no hardcoded colors. Code-simplifier runs after all features to clean up any drift.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, CSS animations

**Context from previous chunks:**
- `types/workout.ts` — Workout, WorkoutLog, Sport, Phase types
- `frontend-design-triathlon.md` — design system with CSS variables, typography, colors, motion
- All components from Chunks 1–7: Calendar.tsx, DayCell.tsx, SportPill.tsx, WorkoutModal.tsx, WorkoutLogger.tsx, PhaseBanner.tsx, CalendarHeader.tsx

---

## Task 1: Loading States with Skeleton Day Cells

**Files:**
- Modify: `app/page.tsx:1-20` — add loading state
- Modify: `components/DayCell.tsx:1-30` — add skeleton variant

**Step 1: Add skeleton day cell component**

```tsx
// In DayCell.tsx, add skeleton variant
interface SkeletonCellProps {
  isLoading: boolean
}

export function SkeletonDayCell({ isLoading }: SkeletonCellProps) {
  if (!isLoading) return null
  
  return (
    <div className="day-cell skeleton">
      <div className="skeleton-day-number" />
      <div className="skeleton-pills">
        <div className="skeleton-pill" />
        <div className="skeleton-pill" />
      </div>
      <style jsx>{`
        .skeleton .skeleton-day-number {
          width: 24px;
          height: 20px;
          background: var(--bg-secondary);
          border-radius: 2px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton .skeleton-pills {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }
        .skeleton .skeleton-pill {
          width: 40px;
          height: 16px;
          background: var(--bg-secondary);
          border-radius: 2px;
          animation: pulse 1.5s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
```

**Step 2: Add loading state to page**

```tsx
// In app/page.tsx, wrap Calendar in Suspense with skeleton fallback
import { Suspense } from 'react'

function CalendarSkeleton() {
  return (
    <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
      {Array.from({ length: 35 }).map((_, i) => (
        <SkeletonDayCell key={i} isLoading={true} />
      ))}
    </div>
  )
}

export default function Page() {
  // ... existing code
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <Calendar workouts={workouts} />
    </Suspense>
  )
}
```

**Step 3: Verify skeleton shows during data fetch**

Expected: Skeleton cells visible for ~100-200ms while API loads

**Step 4: Commit**

```bash
git add components/DayCell.tsx app/page.tsx
git commit -m "feat: add skeleton loading states for calendar"
```

---

## Task 2: Empty States — Rest Days and Error Handling

**Files:**
- Modify: `components/DayCell.tsx:30-80` — handle null workout (rest day)
- Modify: `components/Calendar.tsx:1-30` — handle empty month

**Step 1: Style rest days as empty states**

```tsx
// In DayCell.tsx, render rest day (null workout) quietly
interface DayCellProps {
  day: number
  workout: Workout | null
  isToday: boolean
  isCurrentMonth: boolean
  onClick: () => void
}

export default function DayCell({ day, workout, isToday, isCurrentMonth, onClick }: DayCellProps) {
  const isRestDay = !workout
  
  return (
    <div
      className={`day-cell ${isRestDay ? 'rest-day' : ''} ${isToday ? 'today' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span className={`day-number ${!isCurrentMonth ? 'other-month' : ''}`}>{day}</span>
      {!isRestDay && <SportPills sports={workout.sports} />}
      
      <style jsx>{`
        .day-cell.rest-day {
          background: var(--bg-secondary);
        }
        .day-cell.rest-day .day-number {
          color: var(--text-muted);
        }
        .other-month {
          color: var(--text-muted);
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}
```

**Step 2: Add error boundary for calendar**

```tsx
// Create components/CalendarErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class CalendarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-state">
          <p>Unable to load calendar</p>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Step 3: Wrap Calendar in error boundary**

```tsx
// In app/page.tsx
import { CalendarErrorBoundary } from '@/components/CalendarErrorBoundary'

export default function Page() {
  // ... existing fetch
  
  return (
    <CalendarErrorBoundary>
      <Calendar workouts={workouts} />
    </CalendarErrorBoundary>
  )
}
```

**Step 4: Test error state**

Expected: Error boundary catches any render errors, shows recovery UI

**Step 5: Commit**

```bash
git add components/DayCell.tsx components/CalendarErrorBoundary.tsx app/page.tsx
git commit -m "feat: add rest day styling and error boundary"
```

---

## Task 3: Responsive Layout at 768px Breakpoint

**Files:**
- Modify: `app/globals.css` — add tablet breakpoint
- Modify: `components/DayCell.tsx` — adjust min-height for tablet

**Step 1: Add responsive CSS to globals.css**

```css
/* In app/globals.css, add tablet breakpoint */
@media (max-width: 768px) {
  .calendar-grid {
    --day-cell-min-height: 80px;
  }
  
  .day-cell {
    min-height: var(--day-cell-min-height, 80px);
    padding: 6px 8px;
  }
  
  .sport-pill {
    padding: 1px 5px;
    font-size: 0.65rem;
  }
  
  .modal {
    padding: 20px 24px;
    max-width: 95%;
  }
}
```

**Step 2: Update DayCell to use CSS variable**

```tsx
// In DayCell.tsx style block
<style jsx>{`
  .day-cell {
    min-height: var(--day-cell-min-height, 120px);
  }
`}</style>
```

**Step 3: Test at 768px viewport**

Expected: Day cells shrink to 80px min-height, no horizontal scroll, modal fits screen

**Step 4: Commit**

```bash
git add app/globals.css components/DayCell.tsx
git commit -m "feat: add 768px tablet breakpoint"
```

---

## Task 4: Dark Mode Audit — Verify No Hardcoded Colors

**Files:**
- Modify: All component files — replace any hardcoded colors with CSS variables

**Step 1: Search for hardcoded colors**

```bash
grep -r "#F4F1EC\|#ECEAE3\|#1E1C19\|#2E6B9E\|#C47A2A\|#3A7D52\|#7A4F8A" components/
```

Expected: No matches (all colors should use CSS variables)

**Step 2: Check Tailwind config for color mapping**

If any Tailwind classes are used instead of CSS variables, update to use design tokens

**Step 3: Test dark mode toggle**

Expected: All components respond to `data-theme="dark"` correctly

**Step 4: Commit**

```bash
git add components/ app/globals.css
git commit -m "fix: audit dark mode colors, use CSS variables throughout"
```

---

## Task 5: Accessibility — Keyboard Nav, Focus States, ARIA

**Files:**
- Modify: `components/Calendar.tsx` — add keyboard navigation between cells
- Modify: `components/WorkoutModal.tsx` — add ARIA roles
- Modify: `components/SportPill.tsx` — add aria-label
- Modify: `components/DayCell.tsx` — add focus states

**Step 1: Add keyboard navigation to Calendar**

```tsx
// In Calendar.tsx, wrap in a focused container
export function Calendar({ workouts }: { workouts: Workout[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const current = selectedDate ? new Date(selectedDate) : new Date()
    let next: Date
    
    switch (e.key) {
      case 'ArrowRight':
        next = new Date(current.setDate(current.getDate() + 1))
        setSelectedDate(format(next, 'yyyy-MM-dd'))
        break
      case 'ArrowLeft':
        next = new Date(current.setDate(current.getDate() - 1))
        setSelectedDate(format(next, 'yyyy-MM-dd'))
        break
      case 'ArrowDown':
        next = new Date(current.setDate(current.getDate() + 7))
        setSelectedDate(format(next, 'yyyy-MM-dd'))
        break
      case 'ArrowUp':
        next = new Date(current.setDate(current.getDate() - 7))
        setSelectedDate(format(next, 'yyyy-MM-dd'))
        break
      case 'Enter':
      case ' ':
        if (selectedDate && getWorkoutForDate(selectedDate)) {
          // Open modal
        }
        break
    }
  }
  
  return (
    <div 
      className="calendar" 
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-label="Training calendar"
    >
      {/* calendar grid */}
    </div>
  )
}
```

**Step 2: Add focus styles to DayCell**

```tsx
// In DayCell.tsx style block
<style jsx>{`
  .day-cell:focus {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
`}</style>
```

**Step 3: Add ARIA to WorkoutModal**

```tsx
// In WorkoutModal.tsx
return (
  <div 
    className="modal-overlay"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2 id="modal-title" className="modal-title">{title}</h2>
      {/* content */}
    </div>
  </div>
)
```

**Step 4: Add aria-label to SportPill**

```tsx
// In SportPill.tsx
export function SportPill({ sport }: { sport: Sport }) {
  const labels = { swim: 'Swimming', bike: 'Cycling', run: 'Running', strength: 'Strength' }
  
  return (
    <span 
      className={`sport-pill sport-${sport}`}
      aria-label={labels[sport]}
    >
      {sport}
    </span>
  )
}
```

**Step 5: Test keyboard navigation**

Expected: Arrow keys move focus, Enter opens modal, Tab cycles through form fields in logger, ESC closes modal

**Step 6: Commit**

```bash
git add components/Calendar.tsx components/DayCell.tsx components/WorkoutModal.tsx components/SportPill.tsx
git commit -m "feat: add keyboard navigation and ARIA accessibility"
```

---

## Task 6: Code-Simplifier Pass

**Files:**
- All component files from Chunks 1–7

**Step 1: Invoke code-simplifier agent**

Per CLAUDE.md instructions, invoke the code-simplifier agent on all components:

```
Use the code-simplifier agent to review:
- components/Calendar.tsx
- components/DayCell.tsx
- components/SportPill.tsx
- components/WorkoutModal.tsx
- components/WorkoutLogger.tsx
- components/PhaseBanner.tsx
- components/CalendarHeader.tsx
- components/CalendarErrorBoundary.tsx (from Task 2)
```

Expected: Agent identifies any drift from original design, unused imports, redundant logic

**Step 2: Fix any issues found**

Apply suggestions from code-simplifier

**Step 3: Commit**

```bash
git add components/
git commit -m "refactor: code-simplifier pass on all components"
```

---

## Task 7: Final Review — TypeScript Check & Code Review

**Files:**
- All TypeScript files

**Step 1: Run TypeScript check**

```bash
npm run typecheck
# or: npx tsc --noEmit
```

Expected: No TypeScript errors

**Step 2: Run code review skill**

```bash
# Invoke superpowers:requesting-code-review on the codebase
```

This will perform final review of all components against success criteria

**Step 3: Commit any final fixes**

```bash
git add .
git commit -m "fix: resolve any final review issues"
```

---

## Success Criteria Validation

- [ ] No layout breaks at 768px
- [ ] Dark mode looks intentional, not broken
- [ ] Modal is keyboard accessible (tab through fields, ESC closes)
- [ ] Lighthouse accessibility score 90+
- [ ] No TypeScript errors (`tsc --noEmit` passes clean)
- [ ] Code-simplifier has reviewed all components
- [ ] superpowers:requesting-code-review sign-off

---

## Plan Complete

**Execution choice:**

1. **Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration
2. **Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

**Which approach?**