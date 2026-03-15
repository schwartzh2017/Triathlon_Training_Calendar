# Workout Logger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable athletes to log how each workout went, persisted to disk as JSON files per day, with visual indicators on calendar cells for logged days.

**Architecture:** File-based storage using JSON in `/logs` directory. API route handles GET (read log) and POST (save log). Frontend component lives inside the workout modal, below the workout body. Calendar cells show a small indicator dot when a log exists.

**Tech Stack:** Next.js App Router, TypeScript, file system (fs), gray-matter types already defined

---

### Task 1: Create logs directory and gitignore entry

**Files:**
- Create: `logs/` (empty directory)
- Modify: `.gitignore`

**Step 1: Add gitignore entry**

Edit `.gitignore` to add:
```
logs/
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add logs/ to gitignore"
```

---

### Task 2: Create Log API route (GET and POST handlers)

**Files:**
- Create: `app/api/log/route.ts`

**Step 1: Write the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOGS_DIR = path.join(process.cwd(), 'logs')

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true })
  }
}

function getLogPath(date: string): string {
  return path.join(LOGS_DIR, `${date}.json`)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
  }

  const logPath = getLogPath(date)

  if (!fs.existsSync(logPath)) {
    return NextResponse.json(null)
  }

  try {
    const content = fs.readFileSync(logPath, 'utf-8')
    const log = JSON.parse(content)
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to read log' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  ensureLogsDir()

  try {
    const body = await request.json()
    const { date, status, rpe, actualDuration, notes } = body

    if (!date || !status || rpe === undefined) {
      return NextResponse.json(
        { error: 'date, status, and rpe are required' },
        { status: 400 }
      )
    }

    const logPath = getLogPath(date)
    const log = {
      date,
      status,
      rpe,
      actualDuration: actualDuration || null,
      notes: notes || null,
    }

    fs.writeFileSync(logPath, JSON.stringify(log, null, 2))
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 })
  }
}
```

**Step 2: Test the API manually**

Run dev server, then:
```bash
# Test POST
curl -X POST http://localhost:3000/api/log \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-03-13","status":"completed","rpe":6,"actualDuration":"1h 15min","notes":"Felt good"}'

# Verify file created
ls logs/2026-03-13.json

# Test GET
curl "http://localhost:3000/api/log?date=2026-03-13"
```

Expected: POST creates file, GET returns the JSON

**Step 3: Commit**

```bash
git add app/api/log/route.ts
git commit -m "feat: add log API route for GET and POST"
```

---

### Task 3: Create WorkoutLogger component

**Files:**
- Create: `components/WorkoutLogger.tsx`

**Step 1: Write the component**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface WorkoutLoggerProps {
  date: string
  onLogSaved?: () => void
}

type LogStatus = 'completed' | 'modified' | 'skipped'

export default function WorkoutLogger({ date, onLogSaved }: WorkoutLoggerProps) {
  const [status, setStatus] = useState<LogStatus>('completed')
  const [rpe, setRpe] = useState(5)
  const [actualDuration, setActualDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadLog() {
      try {
        const res = await fetch(`/api/log?date=${date}`)
        if (res.ok) {
          const log = await res.json()
          if (log) {
            setStatus(log.status)
            setRpe(log.rpe)
            setActualDuration(log.actualDuration || '')
            setNotes(log.notes || '')
          }
        }
      } catch (e) {
        console.error('Failed to load log', e)
      } finally {
        setLoading(false)
      }
    }
    loadLog()
  }, [date])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          status,
          rpe,
          actualDuration: actualDuration || null,
          notes: notes || null,
        }),
      })
      if (res.ok) {
        setSaved(true)
        onLogSaved?.()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (e) {
      console.error('Failed to save log', e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="logger-skeleton">Loading...</div>
  }

  return (
    <div className="workout-logger">
      <div className="logger-header">
        <span className="logger-label">Log Your Workout</span>
      </div>

      <div className="status-toggle">
        <label className="field-label">Status</label>
        <div className="toggle-buttons">
          {(['completed', 'modified', 'skipped'] as LogStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`status-btn ${status === s ? 'active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rpe-slider">
        <label className="field-label">
          RPE: <span className="rpe-value">{rpe}/10</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="range-input"
        />
        <div className="rpe-labels">
          <span>Easy</span>
          <span>Max</span>
        </div>
      </div>

      <div className="duration-input">
        <label className="field-label">Actual Duration</label>
        <input
          type="text"
          value={actualDuration}
          onChange={(e) => setActualDuration(e.target.value)}
          placeholder="e.g. 1h 15min"
          className="text-input"
        />
      </div>

      <div className="notes-input">
        <label className="field-label">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel? Any observations?"
          className="textarea-input"
          rows={3}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="save-btn"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Log'}
      </button>
    </div>
  )
}
```

**Step 2: Add component styles to globals.css**

Add to `app/globals.css`:
```css
.workout-logger {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.logger-header {
  margin-bottom: 16px;
}

.logger-label {
  font-family: 'Tenor Sans', sans-serif;
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-label {
  display: block;
  font-family: 'Tenor Sans', sans-serif;
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.status-toggle {
  margin-bottom: 16px;
}

.toggle-buttons {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-family: 'Libre Baskerville', serif;
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all 150ms ease;
}

.status-btn:hover {
  border-color: var(--border-strong);
}

.status-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #FAF9F6;
}

.rpe-slider {
  margin-bottom: 16px;
}

.rpe-value {
  color: var(--text-primary);
}

.range-input {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent-primary);
  border-radius: 2px;
  cursor: pointer;
}

.rpe-labels {
  display: flex;
  justify-content: space-between;
  font-family: 'Libre Baskerville', serif;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: 4px;
}

.duration-input {
  margin-bottom: 16px;
}

.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-sm);
  border-radius: 2px;
}

.text-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.notes-input {
  margin-bottom: 16px;
}

.textarea-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  font-size: var(--text-sm);
  border-radius: 2px;
  resize: vertical;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent-primary);
  border: none;
  color: #FAF9F6;
  font-family: 'Tenor Sans', sans-serif;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background 150ms ease;
  border-radius: 2px;
}

.save-btn:hover:not(:disabled) {
  background: var(--accent-warm);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

**Step 3: Test the component**

Start dev server, click on a day with a workout, verify the logger appears below the workout body with all fields.

**Step 4: Commit**

```bash
git add components/WorkoutLogger.tsx app/globals.css
git commit -m "feat: add WorkoutLogger component with form fields"
```

---

### Task 4: Integrate WorkoutLogger into WorkoutModal

**Files:**
- Modify: `components/WorkoutModal.tsx`

**Step 1: Read existing component**

```bash
cat components/WorkoutModal.tsx
```

**Step 2: Add WorkoutLogger import and usage**

Add import at top:
```typescript
import WorkoutLogger from './WorkoutLogger'
```

Add before closing modal div (after workout body, before closing tags):
```tsx
<WorkoutLogger date={workout.date} onLogSaved={() => setLogged(true)} />
```

**Step 3: Commit**

```bash
git add components/WorkoutModal.tsx
git commit -m "feat: integrate WorkoutLogger into WorkoutModal"
```

---

### Task 5: Add logged indicator to calendar day cells

**Files:**
- Modify: `components/DayCell.tsx`

**Step 1: Modify DayCell to accept and display logged indicator**

Update DayCell to receive a `logged` prop and show a small dot:

```typescript
interface DayCellProps {
  date: Date
  workout: Workout | null
  isToday: boolean
  logged?: boolean  // NEW PROP
}

// In render, after sport pills:
{logged && (
  <span className="logged-indicator" />
)}
```

Add CSS to globals.css:
```css
.logged-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--accent-primary);
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}
```

**Step 2: Pass logged prop from Calendar**

The Calendar needs to know which days have logs. You have two options:
1. Add a new API endpoint to get all logged dates
2. Fetch log status lazily when modal opens (already done in Task 3)

For simplicity, the visual indicator can be added after the modal saves a log (using React state in the parent page to track which dates have been logged).

**Step 3: Commit**

```bash
git add components/DayCell.tsx app/globals.css
git commit -m "feat: add logged indicator to DayCell"
```

---

### Task 6: Run typecheck and verify

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 2: Verify success criteria**

- [ ] API returns log for a given date
- [ ] POST creates /logs/YYYY-MM-DD.json file
- [ ] WorkoutLogger loads existing log when modal opens
- [ ] Save persists all fields correctly
- [ ] `/logs` directory is gitignored
- [ ] Calendar shows indicator for logged days

**Step 3: Commit**

```bash
git add .
git commit -m "feat: complete workout logging feature"
```

---

## Files Summary

| Action | File |
|--------|------|
| Create | `app/api/log/route.ts` |
| Create | `components/WorkoutLogger.tsx` |
| Modify | `.gitignore` |
| Modify | `app/globals.css` |
| Modify | `components/WorkoutModal.tsx` |
| Modify | `components/DayCell.tsx` |

## Dependencies

- No new npm packages required — uses native `fs` module
- Reuses existing types from `types/workout.ts`
