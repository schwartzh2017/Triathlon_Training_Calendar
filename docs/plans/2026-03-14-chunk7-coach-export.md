# Coach Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** One-click copy of workout log formatted for the coach thread, with "Copied!" confirmation.

**Architecture:** Pure string formatting utility in `lib/` folder, integrated into existing WorkoutLogger component. No external dependencies - uses `navigator.clipboard.writeText()` for clipboard.

**Tech Stack:** TypeScript, React state, navigator.clipboard API

---

### Task 1: Create coach update formatter utility

**Files:**
- Create: `lib/formatCoachUpdate.ts`

**Step 1: Write the formatter function**

```typescript
import { Workout, WorkoutLog } from '@/types/workout'

export function formatCoachUpdate(workout: Workout, log: WorkoutLog): string {
  const dateStr = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const sports = workout.sports
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ')

  const statusLabel = log.status.charAt(0).toUpperCase() + log.status.slice(1)

  let output = `WORKOUT LOG — ${dateStr}\n`
  output += `Phase: ${workout.phase.charAt(0).toUpperCase() + workout.phase.slice(1)}  |  Sports: ${sports}\n\n`
  output += `Planned: ${workout.summary}\n`
  output += `Status: ${statusLabel}\n`

  if (log.actualDuration) {
    output += `Actual Duration: ${log.actualDuration}\n`
  }

  output += `RPE: ${log.rpe}/10\n`

  if (log.notes) {
    output += `\nNotes:\n${log.notes}\n`
  }

  return output
}
```

**Step 2: Commit**

```bash
git add lib/formatCoachUpdate.ts
git commit -m "feat: add coach update formatter utility"
```

---

### Task 2: Update WorkoutLogger with copy button

**Files:**
- Modify: `components/WorkoutLogger.tsx`

**Step 1: Read existing component**

Read the current `components/WorkoutLogger.tsx` to understand its structure.

**Step 2: Add copy button and confirmation state**

Add these imports at the top:
```typescript
import { formatCoachUpdate } from '@/lib/formatCoachUpdate'
import { useState } from 'react'
```

Add state and handler inside the component (after existing state declarations):
```typescript
const [copied, setCopied] = useState(false)

const handleCopyCoachUpdate = async () => {
  if (!workout || !log) return

  const formatted = formatCoachUpdate(workout, log)
  await navigator.clipboard.writeText(formatted)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

**Step 3: Add copy button UI**

Add the button below the form, after the "Save Log" button. Only show when `log` exists (after it's been saved):
```tsx
{log && (
  <button
    onClick={handleCopyCoachUpdate}
    className="mt-4 px-4 py-2 bg-[var(--sport-bike)] text-[var(--bg-card)] rounded-[2px] text-sm font-['Tenor_Sans'] transition-all duration-150 hover:bg-[var(--accent-warm)]"
  >
    {copied ? 'Copied!' : 'Copy Coach Update'}
  </button>
)}
```

**Step 4: Verify styles match design system**

- Button color: `--sport-bike` (amber/clay) for action
- Text color: `--bg-card` (warm white)
- Border radius: 2px (journal feel)
- Font: Tenor Sans
- Hover: `--accent-warm`

**Step 5: Commit**

```bash
git add components/WorkoutLogger.tsx
git commit -m "feat: add copy coach update button to workout logger"
```

---

### Task 3: Verify implementation

**Step 1: Test the copy functionality**

1. Open the app and navigate to a day with a workout
2. Open the workout modal
3. Fill out and save a log
4. Click "Copy Coach Update" button
5. Paste in a text editor to verify format matches expected output

**Step 2: Verify "Copied!" confirmation**

- Button text should change to "Copied!" immediately after click
- Button should revert to "Copy Coach Update" after 2 seconds

**Step 3: Verify button visibility**

- Button should NOT appear when no log has been saved yet
- Button should appear after saving a log and reopening the modal

**Step 4: Commit**

```bash
git commit -m "test: verify coach export functionality"
```

---

### Task 4: Code simplifier pass

**Files:**
- Run: Code simplifier agent on `components/WorkoutLogger.tsx` and `lib/formatCoachUpdate.ts`

**Step 1: Invoke code simplifier**

Per the Claude.md instructions, invoke the code-simplifier agent on the modified files.

**Step 2: Commit any changes**

```bash
git add components/WorkoutLogger.tsx lib/formatCoachUpdate.ts
git commit -m "refactor: code simplifier pass on coach export"
```

---

### Success Criteria

- [ ] "Copy Coach Update" button appears only after a log is saved
- [ ] Output format matches the expected coach thread format exactly
- [ ] "Copied!" confirmation shows and fades after 2 seconds
- [ ] Button uses correct colors from design system (--sport-bike)
- [ ] No TypeScript errors
- [ ] Code simplifier has reviewed the code
