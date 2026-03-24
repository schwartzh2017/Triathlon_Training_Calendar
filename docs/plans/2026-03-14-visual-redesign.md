# Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the triathlon calendar with forest green accents, an earthy sport palette, a redesigned 2-row header, phase legend, and a Race Day cell.

**Architecture:** Pure CSS variable changes cascade automatically. Type system expansion requires updating `types/workout.ts`, `lib/constants.ts`, and `app/globals.css` in concert. Calendar.tsx gets a Monday-label removal and a May 31 special cell. CalendarHeader.tsx is restructured into a 2-row layout with a Today button. A new PhaseLegend component sits below the grid.

**Tech Stack:** Next.js 14, TypeScript, Tailwind, CSS variables

---

### Task 1: Accent color → forest green + expand Sport type

**Files:**
- Modify: `app/globals.css`
- Modify: `types/workout.ts`
- Modify: `lib/constants.ts`

**Step 1: Update `--accent-primary` in `app/globals.css`**

In `:root`, change:
```css
--accent-primary: #2E6B9E;
--accent-warm: #C47A2A;
```
to:
```css
--accent-primary: #3A6B45;
--accent-warm: #C47A2A;
```

In `[data-theme="dark"]`, change:
```css
--accent-primary: #5A9EC8;
```
to:
```css
--accent-primary: #5A9E72;
```

**Step 2: Add all 8 sport CSS variables to `app/globals.css`**

In `:root`, replace the four sport vars with:
```css
--sport-swim:             #6B7A8A;
--sport-bike:             #8B6347;
--sport-run:              #3A6B45;
--sport-strength:         #9E8B6E;
--sport-pilates:          #7A9E7E;
--sport-plyometrics:      #5C6B3A;
--sport-sauna:            #B89060;
--sport-contrast-therapy: #6B8A88;
```

In `[data-theme="dark"]`, replace the four dark sport vars with:
```css
--sport-swim:             #8B9EAA;
--sport-bike:             #A87D5E;
--sport-run:              #5A9E72;
--sport-strength:         #B8A08A;
--sport-pilates:          #9ABE9E;
--sport-plyometrics:      #7A8E5A;
--sport-sauna:            #CCA870;
--sport-contrast-therapy: #8AACAA;
```

**Step 3: Expand `Sport` type in `types/workout.ts`**

Change:
```ts
export type Sport = 'swim' | 'bike' | 'run' | 'strength'
```
to:
```ts
export type Sport = 'swim' | 'bike' | 'run' | 'strength' | 'pilates' | 'plyometrics' | 'sauna' | 'contrast-therapy'
```

**Step 4: Update `lib/constants.ts` with all 8 sports**

Replace `SPORT_COLORS` and `SPORT_LABELS`:
```ts
export const SPORT_COLORS: Record<Sport, string> = {
  swim:               'var(--sport-swim)',
  bike:               'var(--sport-bike)',
  run:                'var(--sport-run)',
  strength:           'var(--sport-strength)',
  pilates:            'var(--sport-pilates)',
  plyometrics:        'var(--sport-plyometrics)',
  sauna:              'var(--sport-sauna)',
  'contrast-therapy': 'var(--sport-contrast-therapy)',
}

export const SPORT_LABELS: Record<Sport, string> = {
  swim:               'Swim',
  bike:               'Bike',
  run:                'Run',
  strength:           'Strength',
  pilates:            'Pilates',
  plyometrics:        'Plyo',
  sauna:              'Sauna',
  'contrast-therapy': 'Contrast',
}
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 6: Commit**

```bash
git add app/globals.css types/workout.ts lib/constants.ts
git commit -m "feat: forest green accent, expand Sport type to 8 sports"
```

---

### Task 2: Redesign CalendarHeader — 2-row layout + Today button

**Files:**
- Modify: `components/CalendarHeader.tsx`

**Step 1: Rewrite CalendarHeader**

Replace the entire file content with:

```tsx
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
            className="px-3 py-1 hover:bg-[var(--bg-secondary)] rounded"
            style={{
              fontFamily: "'Tenor Sans', sans-serif",
              fontSize: 'var(--text-sm)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '2px',
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
```

**Step 2: Verify compile**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add components/CalendarHeader.tsx
git commit -m "feat: 2-row header with PDX Triathlon title and Today button"
```

---

### Task 3: Remove phase labels from calendar cells

**Files:**
- Modify: `components/Calendar.tsx`

**Step 1: Remove the Monday phase label block**

In `Calendar.tsx`, find and delete this entire block (around lines 209–224):

```tsx
{isMonday && phase && phaseColor && (
  <span
    aria-hidden="true"
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
```

Also remove the `isMonday` variable declaration since it's no longer used:
```tsx
const isMonday = dayIdx === 0
```

**Step 2: Verify compile**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add components/Calendar.tsx
git commit -m "feat: remove phase labels from calendar day cells"
```

---

### Task 4: Add RACE DAY cell on May 31

**Files:**
- Modify: `components/Calendar.tsx`

**Step 1: Add race day detection inside the day cell render**

After `const isLogged = loggedDates.has(dateStr)`, add:
```tsx
const isRaceDay = dateStr === '2026-05-31'
```

**Step 2: Add RACE DAY display inside the day cell, after the sport pills block**

After the `{workout && workout.sports.length > 0 && ...}` block, add:
```tsx
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
```

**Step 3: Verify compile**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 4: Commit**

```bash
git add components/Calendar.tsx
git commit -m "feat: add RACE DAY label on May 31"
```

---

### Task 5: Add phase legend below the calendar

**Files:**
- Create: `components/PhaseLegend.tsx`
- Modify: `components/Calendar.tsx`

**Step 1: Create `components/PhaseLegend.tsx`**

```tsx
import { PHASE_COLORS, PHASE_LABELS } from '@/lib/constants'
import { Phase } from '@/types/workout'

const PHASES: Phase[] = ['base', 'race-prep', 'taper']

export default function PhaseLegend() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        marginTop: '12px',
        fontFamily: "'Tenor Sans', sans-serif",
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
      aria-label="Phase legend"
    >
      {PHASES.map(phase => (
        <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: PHASE_COLORS[phase],
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          {PHASE_LABELS[phase]}
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Import and render PhaseLegend in `components/Calendar.tsx`**

Add import at top:
```tsx
import PhaseLegend from './PhaseLegend'
```

After the closing `</div>` of the grid (after `</WorkoutModal>`), insert:
```tsx
<PhaseLegend />
```

Actually place it between the grid `</div>` and `<WorkoutModal .../>`:
```tsx
      </div>  {/* end grid */}

      <PhaseLegend />

      <WorkoutModal ... />
```

**Step 3: Verify compile**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 4: Commit**

```bash
git add components/PhaseLegend.tsx components/Calendar.tsx
git commit -m "feat: add phase legend below calendar grid"
```

---

### Task 6: Update frontend-design skill to reflect new color system

**Files:**
- Modify: `.claude/skills/frontend-design-triathlon.md`

**Step 1: Update the skill doc**

- Change `--accent-primary` references from lake blue (`#2E6B9E`) to forest green (`#3A6B45`)
- Add the 4 new sports (pilates, plyometrics, sauna, contrast-therapy) to the sport color table
- Update the "App title" reference from "Triathlon Training" to "PDX Triathlon: May 31, 2026"

**Step 2: Commit**

```bash
git add .claude/skills/frontend-design-triathlon.md
git commit -m "docs: update frontend-design skill with new color system and sports"
```

---

## Testing Checklist

After all tasks:
- [ ] Light mode: today cell has green left border
- [ ] Light mode: Save Log button is green
- [ ] Light mode: logged dot is green
- [ ] Dark mode: accent is lighter green
- [ ] All 8 sport pills render with correct earthy colors
- [ ] Header shows "PDX Triathlon: May 31, 2026" on line 1
- [ ] Nav row shows ← March 2026 → and theme toggle
- [ ] Today button appears when navigating away from March
- [ ] Today button hidden when on March 2026
- [ ] No phase text labels in day cells (color banners still present)
- [ ] Phase legend appears bottom-right below grid
- [ ] May 31 shows RACE DAY 🎉
