# Chunk 3: Phase Banners Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render training phases visually as horizontal banners behind each calendar week row, using phase date ranges and colors from the design system.

**Architecture:** Phase configuration stored in `config/phases.ts` with date ranges. PhaseBanner component receives week dates and determines which phase to display based on which phase owns the majority of days in that week.

**Tech Stack:** Next.js 14, TypeScript, Tailwind (utility classes only), date-fns

---

## Context to Include in Brief

- **types/workout.ts** — Already defined in Chunk 1
- **frontend-design-triathlon.md** — Phase section (lines 125-137) defines phase colors and banner styling
- **components/Calendar.tsx** — Existing from Chunk 2, will be modified to include PhaseBanner

---

## Pre-requisites

Ensure the following files exist (from Chunk 2):
- `app/globals.css` — CSS variables including phase colors
- `app/layout.tsx` — Root layout with fonts
- `app/page.tsx` — Main page
- `components/Calendar.tsx` — Calendar grid component
- `components/CalendarHeader.tsx` — Header with navigation

Verify app builds:
```bash
npm run build
```

---

### Task 1: Create Phase Configuration

**Files:**
- Create: `config/phases.ts`

**Step 1: Write phase configuration**

```typescript
export type Phase = 'base' | 'race-prep' | 'taper'

export interface PhaseConfig {
  name: Phase
  label: string
  startDate: string // ISO format: YYYY-MM-DD
  endDate: string   // ISO format: YYYY-MM-DD
}

export const phases: PhaseConfig[] = [
  {
    name: 'base',
    label: 'Base',
    startDate: '2026-03-13',
    endDate: '2026-04-12',
  },
  {
    name: 'race-prep',
    label: 'Race Prep',
    startDate: '2026-04-13',
    endDate: '2026-05-17',
  },
  {
    name: 'taper',
    label: 'Taper',
    startDate: '2026-05-18',
    endDate: '2026-05-31',
  },
]

export function getPhaseForDate(date: string): PhaseConfig | undefined {
  const dateObj = new Date(date)
  return phases.find(phase => {
    const start = new Date(phase.startDate)
    const end = new Date(phase.endDate)
    return dateObj >= start && dateObj <= end
  })
}

export function getPhaseForWeek(weekDates: Date[]): PhaseConfig | undefined {
  if (weekDates.length === 0) return undefined
  
  const phaseCounts = phases.map(phase => {
    const start = new Date(phase.startDate)
    const end = new Date(phase.endDate)
    const count = weekDates.filter(date => date >= start && date <= end).length
    return { phase, count }
  })
  
  const sorted = phaseCounts.sort((a, b) => b.count - a.count)
  return sorted[0]?.count > 0 ? sorted[0].phase : undefined
}
```

**Step 2: Commit**
```bash
git add config/phases.ts
git commit -m "feat: add phase configuration with date ranges"
```

---

### Task 2: Create PhaseBanner Component

**Files:**
- Create: `components/PhaseBanner.tsx`

**Step 1: Write PhaseBanner component**

```typescript
import { Phase, PhaseConfig } from '@/config/phases'

interface PhaseBannerProps {
  phase: PhaseConfig | undefined
}

const phaseColorMap: Record<Phase, string> = {
  'base': 'var(--phase-base)',
  'race-prep': 'var(--phase-race-prep)',
  'taper': 'var(--phase-taper)',
}

export default function PhaseBanner({ phase }: PhaseBannerProps) {
  if (!phase) {
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ borderLeft: '5px solid transparent' }}
      />
    )
  }

  const bgColor = phaseColorMap[phase.name]

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        borderLeft: `5px solid ${bgColor}`,
        backgroundColor: `${bgColor}14`, // 8% opacity (hex 14 ≈ 8%)
      }}
    >
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-xs)] uppercase tracking-[0.10em]"
        style={{ 
          fontFamily: "'Tenor Sans', sans-serif",
          color: 'var(--text-muted)',
        }}
      >
        {phase.label}
      </span>
    </div>
  )
}
```

**Step 2: Commit**
```bash
git add components/PhaseBanner.tsx
git commit -m "feat: add PhaseBanner component with phase colors"
```

---

### Task 3: Integrate PhaseBanner into Calendar

**Files:**
- Modify: `components/Calendar.tsx:1-50`

**Step 1: Add import for PhaseBanner and phase utilities**

Add to imports at top of Calendar.tsx:
```typescript
import { getPhaseForWeek } from '@/config/phases'
import PhaseBanner from './PhaseBanner'
import { format } from 'date-fns'
```

**Step 2: Modify week rendering to include PhaseBanner**

Find the week rendering section (around line 357-392) and update:

```typescript
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
      {/* PhaseBanner overlays the entire week row */}
      <div className="absolute inset-0 -z-10">
        <PhaseBanner phase={phase} />
      </div>
    </div>
  )
})}
```

**Step 3: Run TypeScript check**

```bash
npm run build
```

Expected: Build completes without errors

**Step 4: Commit**
```bash
git add components/Calendar.tsx
git commit -m "feat: integrate PhaseBanner into Calendar week rows"
```

---

### Task 4: Verify Phase Banners Render Correctly

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Verify visual rendering**

Navigate to `http://localhost:3000` and verify:
- Week rows behind calendar cells show phase banners
- Base phase (March 13 → April 12) shows warm tan banner
- Race Prep phase (April 13 → May 17) shows sienna banner
- Taper phase (May 18 → May 31) shows sage green banner
- Phase banners have subtle 8% opacity background
- Phase labels are in Tenor Sans, uppercase, tracked
- Labels readable in both light and dark mode
- Weeks spanning phase boundaries show the phase with majority days

**Step 3: Commit final**
```bash
git add .
git commit -m "feat: complete chunk 3 - phase banners"
```

---

## Files Produced

```
config/
  phases.ts           (new)
components/
  PhaseBanner.tsx     (new)
components/
  Calendar.tsx        (modified - add PhaseBanner integration)
```

---

## Success Criteria

- [ ] Each week row shows the correct phase banner behind it
- [ ] Weeks that span a phase boundary show the phase that owns more days
- [ ] Phase colors are subtle (8% opacity background wash)
- [ ] Left border accent (5px) in phase color
- [ ] Phase labels use Tenor Sans, uppercase, tracked
- [ ] Labels readable in both light and dark mode
- [ ] No TypeScript errors
- [ ] Build passes
