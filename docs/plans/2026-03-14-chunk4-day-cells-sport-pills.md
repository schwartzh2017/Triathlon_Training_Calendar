# Chunk 4 — Day Cells & Sport Pills Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Workout data visible on the calendar - create DayCell and SportPill components to display workout information in day cells.

**Architecture:** Two new components (DayCell, SportPill) that integrate with existing Calendar.tsx. DayCell receives `Workout | null` prop and renders sport pills. SportPill is a reusable color-coded badge component.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, CSS variables from design system

---

## Context for Implementation

### Types (from `types/workout.ts`)
```typescript
export type Sport = 'swim' | 'bike' | 'run' | 'strength'
export type Phase = 'base' | 'race-prep' | 'taper'

export interface Workout {
  date: string        // ISO format: 2026-03-13
  phase: Phase
  sports: Sport[]
  summary: string     // one-line summary for day cell
  title: string       // workout title for modal header
  body: string        // rendered HTML from markdown body
}
```

### Sport Colors from Design System (`frontend-design-triathlon.md`)
| Sport     | Light Mode   | Dark Mode    |
|-----------|--------------|--------------|
| Swim      | #2E6B9E     | #5A9EC8     |
| Bike      | #C47A2A     | #D4944A     |
| Run       | #3A7D52     | #5A9E72     |
| Strength  | #7A4F8A     | #9A6FAA     |

Text on sport pills: always `#FAF9F6` (warm white)

### Day Cell Specs
- Background: `var(--bg-card)`
- Border: `1px solid var(--border)`
- Border-radius: `2px`
- Padding: `8px 10px`
- Min-height: `120px`
- Hover: `box-shadow` lift + `border-color` shift, 150ms ease
- Today's cell: `3px solid var(--accent-primary)` left border

### Sport Pill Specs
- Inline-flex, align-items center
- Gap: 4px
- Padding: `2px 7px`
- Border-radius: `2px`
- Font: Libre Baskerville, `var(--text-xs)`
- Color: `#FAF9F6`
- Margin: `2px 2px 0 0`

---

## Task 1: Create SportPill Component

**Files:**
- Create: `components/SportPill.tsx`

**Step 1: Create the SportPill component**

```typescript
'use client'

import { Sport } from '@/types/workout'

interface SportPillProps {
  sport: Sport
}

const sportColors: Record<Sport, { light: string; dark: string }> = {
  swim: { light: '#2E6B9E', dark: '#5A9EC8' },
  bike: { light: '#C47A2A', dark: '#D4944A' },
  run: { light: '#3A7D52', dark: '#5A9E72' },
  strength: { light: '#7A4F8A', dark: '#9A6FAA' },
}

const sportLabels: Record<Sport, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run: 'Run',
  strength: 'Strength',
}

export default function SportPill({ sport }: SportPillProps) {
  const isDark = typeof window !== 'undefined' && 
    document.documentElement.getAttribute('data-theme') === 'dark'
  const colors = sportColors[sport]
  const bgColor = isDark ? colors.dark : colors.light

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[2px] px-[7px] py-[2px] text-xs"
      style={{
        backgroundColor: bgColor,
        color: '#FAF9F6',
        fontFamily: "'Libre Baskerville', serif",
        fontSize: 'var(--text-xs)',
        margin: '2px 2px 0 0',
      }}
    >
      {sportLabels[sport]}
    </span>
  )
}
```

**Step 2: Commit**

```bash
git add components/SportPill.tsx
git commit -m "feat: add SportPill component for sport badges"
```

---

## Task 2: Create DayCell Component

**Files:**
- Create: `components/DayCell.tsx`

**Step 1: Create the DayCell component**

```typescript
'use client'

import { format } from 'date-fns'
import { Workout } from '@/types/workout'
import SportPill from './SportPill'

interface DayCellProps {
  date: Date
  workout: Workout | null
  isCurrentMonth: boolean
  isToday: boolean
}

export default function DayCell({ date, workout, isCurrentMonth, isToday }: DayCellProps) {
  return (
    <div
      className={`
        min-h-[120px] p-[8px_10px] cursor-pointer
        border-l border-t border-[var(--border)]
        ${!isCurrentMonth ? 'bg-[var(--bg-secondary)] opacity-50' : 'bg-[var(--bg-card)]'}
        ${isToday ? 'border-l-[3px] border-l-[var(--accent-primary)]' : ''}
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
        {format(date, 'd')}
      </span>
      
      {workout && workout.sports.length > 0 && (
        <div className="mt-1">
          {workout.sports.map(sport => (
            <SportPill key={sport} sport={sport} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/DayCell.tsx
git commit -m "feat: add DayCell component with workout display"
```

---

## Task 3: Integrate DayCell into Calendar

**Files:**
- Modify: `components/Calendar.tsx:66-93`

**Step 1: Import DayCell and remove inline day cell JSX**

Replace the import section to add DayCell:
```typescript
import CalendarHeader from './CalendarHeader'
import DayCell from './DayCell'
import { Workout } from '@/types/workout'
```

Replace the day cell rendering (lines 66-93) with:
```typescript
{week.map(day => {
  const isCurrentMonth = isSameMonth(day, currentDate)
  const isTodayDate = isToday(day)
  const workout = workoutMap.get(format(day, 'yyyy-MM-dd')) || null

  return (
    <DayCell
      key={day.toISOString()}
      date={day}
      workout={workout}
      isCurrentMonth={isCurrentMonth}
      isToday={isTodayDate}
    />
  )
})}
```

**Step 2: Run build to verify no TypeScript errors**

```bash
npm run build
# or
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add components/Calendar.tsx
git commit -m "feat: integrate DayCell into Calendar grid"
```

---

## Task 4: Verify Implementation

**Step 1: Run the development server**

```bash
npm run dev
```

**Step 2: Verify visually**
- Navigate to localhost:3000
- Verify days with workouts show correct sport pills with proper colors
- Verify rest days (no workout) show no pills
- Verify today's cell has left border accent
- Verify hover states work (box-shadow + border-color)
- Check both light and dark mode

**Step 3: Commit if changes needed**

---

## Success Criteria

- [ ] Every day with a workout file shows correct sport pills
- [ ] Sport colors match design system exactly
- [ ] Rest days visually quiet but not broken
- [ ] Hover interaction feels like the design spec
- [ ] `Workout | null` type handled cleanly — no runtime errors on rest days
- [ ] No TypeScript errors
