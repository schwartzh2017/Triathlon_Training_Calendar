# Triathlon Training Calendar — Build Plan

## How to Use This Document

Each chunk follows this workflow:
1. Hand the chunk description + context to the **plan-writing skill** → generates implementation plan
2. Hand the plan to a **separate OpenCode instance** → builds the chunk
3. Hand the result to **Claude Code** → review, simplify, error-check

For Chunk 2 onwards, always include the contents of `types/workout.ts` in your
brief so the plan writer and builder reference real types, not invented ones.

---

## TypeScript Types (defined in Chunk 1, used by all subsequent chunks)

File: `types/workout.ts`

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

export interface WorkoutLog {
  date: string
  status: 'completed' | 'modified' | 'skipped'
  rpe: number         // 1–10
  actualDuration?: string
  notes?: string
}
```

---

## Workout MD Frontmatter Schema

Every file in `/workouts` must follow this structure.
Files are named by date: `2026-03-13.md`

```yaml
---
date: 2026-03-13
phase: base
sports: [swim, run]
summary: Easy 1500m swim + 30min easy run
title: Aerobic Base Day
---

Full workout markdown body here...

## Main Set
- 4x400m @ Z2 pace, 30s rest

## Notes
*Keep HR under 140 throughout.*
```

---

## Chunk 1 — Data Layer & API

**Goal:** The foundation everything else reads from.

### Tasks
- Create the `/workouts` directory
- Build `/app/api/workouts/route.ts` — reads all MD files from `/workouts`,
  parses frontmatter with `gray-matter`, renders markdown body with `remark-html`,
  returns typed JSON array of `Workout[]`
- Define TypeScript types in `types/workout.ts` (see above)
- Create 3–4 sample workout MD files covering different sports and phases
  to develop against
- Test that `localhost:3000/api/workouts` returns correct, well-shaped JSON

### Files Produced
```
types/
  workout.ts
app/
  api/
    workouts/
      route.ts
workouts/
  2026-03-13.md   (sample)
  2026-03-14.md   (sample)
  2026-03-15.md   (sample)
  2026-03-16.md   (sample)
```

### Dependencies
- `gray-matter` — frontmatter parsing
- `remark` + `remark-html` — markdown to HTML
- `date-fns` — date utilities

### Success Criteria
- API returns a `Workout[]` array with all fields populated
- `body` field contains rendered HTML, not raw markdown
- Missing workout files (rest days) simply don't appear in the array
- No TypeScript errors

---

## Chunk 2 — Calendar Shell & Layout

**Goal:** App skeleton with correct visual structure. No workout data rendered yet.

### Context to Include in Brief
- Contents of `types/workout.ts`
- Full `frontend-design-triathlon.md`

### Tasks
- `app/layout.tsx` — Google Fonts loaded, CSS variables defined globally,
  dark mode `data-theme` attribute support, global transition rules
- `app/globals.css` — full CSS variable definitions for light and dark mode
  from the design system
- `app/page.tsx` — fetches from `/api/workouts`, passes `Workout[]` down
- `components/Calendar.tsx` — 7-column month grid, week rows, correct
  month boundary logic (greyed out days from prev/next month)
- `components/CalendarHeader.tsx` — app title left-aligned, month nav
  (← March 2026 →) centered, dark mode toggle top-right
- Empty day cells rendering with correct background, border, spacing
- Today's cell highlighted with left border accent

### Files Produced
```
app/
  layout.tsx
  globals.css
  page.tsx
components/
  Calendar.tsx
  CalendarHeader.tsx
```

### Success Criteria
- Calendar renders correct month grid for March–May 2026
- Month navigation works (← →)
- Dark mode toggle switches theme smoothly
- All colors, fonts, spacing from design system — no hardcoded values
- No workout data yet — just the structural shell

---

## Chunk 3 — Phase Banners

**Goal:** Training phases visually indicated across week rows.

### Context to Include in Brief
- Contents of `types/workout.ts`
- Phase section of `frontend-design-triathlon.md`

### Tasks
- `config/phases.ts` — defines phase date ranges:
  - Base: March 13 → April 12
  - Race Prep: April 13 → May 17
  - Taper: May 18 → May 31
- `components/PhaseBanner.tsx` — renders as a row behind each calendar week
- Left border accent (5px) in phase color + low opacity background wash (8%)
- Phase label: Tenor Sans, uppercase, tracked, `--text-muted`
- Correct phase color variables from design system

### Files Produced
```
config/
  phases.ts
components/
  PhaseBanner.tsx
```

### Success Criteria
- Each week row shows the correct phase banner behind it
- Weeks that span a phase boundary show the phase that owns more days
  in that week (or split — designer's call, note preference in brief)
- Phase colors are subtle — never competing with day cell content
- Labels readable in both light and dark mode

---

## Chunk 4 — Day Cells & Sport Pills

**Goal:** Workout data visible on the calendar.

### Context to Include in Brief
- Contents of `types/workout.ts`
- Day Cell and Sport Pill sections of `frontend-design-triathlon.md`

### Tasks
- `components/DayCell.tsx` — receives `Workout | null` prop
  (null = rest day), renders day number + sport pills
- `components/SportPill.tsx` — color-coded badge, receives `Sport` type
- Rest days render quietly: `--bg-secondary`, no pills, no emphasis
- Multi-sport days stack pills with correct spacing
- Hover state: `box-shadow` lift + `border-color` shift, 150ms ease
- Today's cell: `3px solid var(--accent-primary)` left border

### Files Produced
```
components/
  DayCell.tsx
  SportPill.tsx
```

### Success Criteria
- Every day with a workout file shows correct sport pills
- Sport colors match design system exactly (no approximations)
- Rest days visually quiet but not broken
- Hover interaction feels like the design spec
- `Workout | null` type handled cleanly — no runtime errors on rest days

---

## Chunk 5 — Workout Detail Modal

**Goal:** Click a day, see the full workout.

### Context to Include in Brief
- Contents of `types/workout.ts`
- Modal Design section of `frontend-design-triathlon.md`

### Tasks
- `components/WorkoutModal.tsx` — overlay + modal panel
- Overlay: `rgba(30, 28, 25, 0.55)` + `backdrop-filter: blur(3px)`
- Modal anatomy (top to bottom):
  1. Date line — Tenor Sans, `--text-sm`, `--text-muted`, uppercase tracked
  2. Phase badge — phase color pill + Tenor Sans label
  3. Sport badges — row of sport-colored pills
  4. Workout title — Tenor Sans, `--text-lg`
  5. Divider — `1px solid var(--border)`
  6. Full workout body — rendered HTML via `dangerouslySetInnerHTML`,
     Libre Baskerville, line-height 1.75
  7. Intervals/data — JetBrains Mono applied via CSS to `code` and `pre` elements
- Open animation: fade-in + `translateY(8px → 0)`, 200ms ease-out
- Close animation: fade-out, 150ms ease-in
- Click outside overlay to close
- ESC key to close

### Files Produced
```
components/
  WorkoutModal.tsx
```

### Success Criteria
- Modal opens on day cell click, closes on overlay click and ESC
- All markdown renders correctly including lists, headers, bold, italic
- `code` blocks render in JetBrains Mono
- Italic Libre Baskerville applied to `em` elements (coach notes)
- Animations feel like turning a page, not a notification
- No XSS risk — body HTML comes only from your own MD files

---

## Chunk 6 — Workout Logger

**Goal:** Log how each workout actually went, persisted to disk.

### Context to Include in Brief
- Contents of `types/workout.ts` (especially `WorkoutLog` interface)
- Full stack details (Next.js App Router, file-based storage)

### Tasks
- `components/WorkoutLogger.tsx` — lives inside the modal, below the workout body
- Fields:
  - Status toggle: completed / modified / skipped
  - RPE slider: 1–10 with label
  - Actual duration: text input (e.g. "1h 15min")
  - Notes: textarea, italic Libre Baskerville
- `app/api/log/route.ts` — POST handler, writes/updates a single
  `logs/YYYY-MM-DD.json` file per day
- `app/api/log/route.ts` — GET handler, reads log for a given date
- Calendar day cells show a small visual indicator if a log exists
  (subtle dot or checkmark in sport pill color)
- Log state loads when modal opens, persists on save

### Files Produced
```
app/
  api/
    log/
      route.ts
components/
  WorkoutLogger.tsx
logs/              (created at runtime, gitignored)
```

### Success Criteria
- Logging a workout saves a JSON file to `/logs/YYYY-MM-DD.json`
- Reopening the modal shows the previously saved log
- Calendar reflects logged days visually
- Status, RPE, duration, notes all round-trip correctly
- `/logs` directory is in `.gitignore`

---

## Chunk 7 — Coach Export

**Goal:** One-click copy of workout log formatted for the coach thread.

### Context to Include in Brief
- Contents of `types/workout.ts`
- Example of the formatted output message (see below)

### Tasks
- "Copy Coach Update" button inside `WorkoutLogger`, only visible
  when a log has been saved
- Formats a clean structured message from `Workout` + `WorkoutLog`:

```
WORKOUT LOG — March 13, 2026
Phase: Base  |  Sports: Swim, Run

Planned: Easy 1500m swim + 30min easy run
Status: Completed
Actual Duration: 1h 20min
RPE: 6/10

Notes:
Felt good on the swim, HR stayed low. Run felt heavy in the last
10 minutes — legs not fully recovered from yesterday.
```

- Copies to clipboard using `navigator.clipboard.writeText()`
- Shows brief inline "Copied!" confirmation (fades out after 2s)
- No external dependencies — pure string formatting

### Files Produced
```
components/
  WorkoutLogger.tsx  (updated — adds copy button and formatter)
lib/
  formatCoachUpdate.ts
```

### Success Criteria
- Button only appears after a log is saved
- Output is clean, readable, paste-ready
- "Copied!" confirmation works and fades gracefully
- Formatting handles all status types and optional fields cleanly

---

## Chunk 8 — Polish & Hardening

**Goal:** Production-ready feel, no rough edges.

### Context to Include in Brief
- Full `frontend-design-triathlon.md`
- All component files from Chunks 1–7

### Tasks
- **Loading states** — skeleton day cells while API fetches (CSS animation,
  no external library)
- **Empty states** — rest days, months with no workouts, graceful API errors
- **Error boundaries** — wrap Calendar in React error boundary
- **Responsive layout** — fully functional at 768px tablet breakpoint,
  day cell min-height drops to 80px
- **Dark mode audit** — every component tested in dark mode, no
  hardcoded colors that break theme
- **Accessibility** — keyboard navigation through day cells, focus states
  visible, modal has correct ARIA roles (`role="dialog"`, `aria-modal`),
  sport pills have `aria-label`
- **Code-simplifier pass** — run across all components, clean up any
  drift from the 8-chunk build
- **Final review** — `superpowers:requesting-code-review` on full codebase

### Success Criteria
- No layout breaks at 768px
- Dark mode looks intentional, not broken
- Modal is keyboard accessible (tab through fields, ESC closes)
- Lighthouse accessibility score 90+
- No TypeScript errors (`tsc --noEmit` passes clean)
- Code-simplifier has reviewed all components
- superpowers:code-reviewer sign-off

---

## Build Order

```
Chunk 1 → Chunk 2 → Chunk 3 → Chunk 4 → Chunk 5 → Chunk 6 → Chunk 7 → Chunk 8
```

**Do not start Chunk 4 until Chunk 1's API is returning real data.**
Every chunk from 2 onwards should include `types/workout.ts` in its brief.