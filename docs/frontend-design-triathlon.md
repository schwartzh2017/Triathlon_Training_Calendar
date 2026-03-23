---
name: frontend-design-triathlon
description: >
  Design system and aesthetic guidelines for the Triathlon Training Calendar.
  Load this skill whenever building or modifying any UI component, page, or
  layout. Ensures all frontend work stays visually consistent, performance-driven,
  and true to an athletic field-journal aesthetic.
---

# Frontend Design — Triathlon Training Calendar

Every interface built for this project should feel like a **coach's planning board
meets a performance logbook** — structured, purposeful, typographically confident,
and physically grounded. This is NOT a generic calendar app. It should feel like it
was designed by someone who actually trains.

---

## Aesthetic Direction

**Core vibe:** Athletic field journal. Think training logs, race binders, a
well-worn Moleskine filled with splits and intervals. Data-forward but warm —
not a sterile sports analytics dashboard.

**Tone:** Editorial minimalism with performance discipline. Strong typographic
hierarchy. Clean whitespace. Color used with intention — not decoration.

**Anti-patterns to avoid:**
- Generic calendar app look (Google Calendar blues, flat pill badges everywhere)
- Cluttered day cells with too much competing text
- Overly bright "fitness app" neons or gradients
- Rounded-everything UI kit aesthetics
- Pure white or pure black backgrounds — always warm or cool tinted

---

## Color System

Use CSS variables exclusively. Both light and dark themes must be defined.

### Light Mode
```css
:root {
  --bg-primary: #F4F1EC;        /* warm limestone white */
  --bg-secondary: #ECEAE3;      /* slightly deeper warm grey */
  --bg-card: #FAF9F6;           /* near-white warm */
  --text-primary: #1E1C19;      /* near-black warm */
  --text-secondary: #4A4540;    /* dark warm grey */
  --text-muted: #8A8178;        /* muted warm grey */

  /* Sport Colors — distinct, bold, not neon */
  --sport-swim: #2E6B9E;        /* deep lake blue */
  --sport-bike: #C47A2A;        /* amber/clay */
  --sport-run: #3A7D52;         /* forest green */
  --sport-strength: #7A4F8A;    /* deep plum */

  /* Phase Colors */
  --phase-base: #D4C9B0;        /* warm tan — base/build */
  --phase-race-prep: #C4845A;   /* sienna — intensity/race prep */
  --phase-taper: #7A9E7E;       /* sage green — taper/rest */

  /* UI Chrome */
  --accent-primary: #2E6B9E;    /* lake blue — primary actions */
  --accent-warm: #C47A2A;       /* amber — highlights, hover */
  --border: #D6D0C4;            /* warm tan border */
  --border-strong: #B0A898;     /* stronger border for dividers */
  --shadow: rgba(30, 28, 25, 0.10);
  --shadow-strong: rgba(30, 28, 25, 0.20);
}
```

### Dark Mode
```css
[data-theme="dark"] {
  --bg-primary: #18161300;        /* deep warm black */
  --bg-secondary: #201E1A;      /* slightly lighter */
  --bg-card: #272420;           /* card background */
  --text-primary: #EDE8DF;      /* warm off-white */
  --text-secondary: #B8B0A0;    /* warm tan */
  --text-muted: #7A7268;        /* muted warm grey */

  --sport-swim: #5A9EC8;        /* lighter lake blue */
  --sport-bike: #D4944A;        /* lighter amber */
  --sport-run: #5A9E72;         /* lighter forest green */
  --sport-strength: #9A6FAA;    /* lighter plum */

  --phase-base: #3A3428;        /* muted warm tan */
  --phase-race-prep: #7A4830;   /* deep sienna */
  --phase-taper: #3A5A3E;       /* deep sage */

  --accent-primary: #5A9EC8;
  --accent-warm: #D4944A;
  --border: #3A3530;
  --border-strong: #504840;
  --shadow: rgba(0, 0, 0, 0.35);
  --shadow-strong: rgba(0, 0, 0, 0.55);
}
```

**Color rules:**
- Sport colors are the dominant accent palette — swim, bike, run, strength each
  own their color and it is used consistently everywhere they appear
- Phase colors appear as background washes behind week rows — subtle, never loud
- Never use pure black (#000) or pure white (#fff)
- One dominant color per component. Never 3+ competing accent colors at once
- Amber (`--accent-warm`) is for hover states and moments of emphasis only

---

## Sport Color Usage

Each sport has a consistent color applied across all UI contexts:

| Sport     | Light Mode        | Usage |
|-----------|-------------------|-------|
| Swim      | `#2E6B9E` (lake blue) | Badge bg, day cell pill, modal header |
| Bike      | `#C47A2A` (amber clay) | Badge bg, day cell pill, modal header |
| Run       | `#3A7D52` (forest green) | Badge bg, day cell pill, modal header |
| Strength  | `#7A4F8A` (deep plum) | Badge bg, day cell pill, modal header |

Text on all sport-colored badges: always `#FAF9F6` (warm white), never pure white.

---

## Phase Color Usage

Phases appear as a horizontal banner/stripe behind the week rows on the calendar:

| Phase       | Color Variable       | Feel |
|-------------|----------------------|------|
| Base/Build  | `--phase-base`       | Neutral, steady — the grind |
| Race Prep   | `--phase-race-prep`  | Warm sienna — urgency, heat |
| Taper       | `--phase-taper`      | Sage green — recovery, calm |

Phase banners: 6–8px left border accent + very low opacity background wash (8–12%).
Label text in `--text-muted`, Tenor Sans, uppercase, tracked.

---

## Typography

### Font Pairing
- **Display / Headings:** `Tenor Sans` — refined, confident, editorial without
  being aggressive. Perfect for month headers, phase labels, modal titles.
- **Body / UI:** `Libre Baskerville` — warm, highly readable, classical weight.
  For workout descriptions, day cell text, navigation labels.
- **Data / Times / Distances:** `JetBrains Mono` — for pace targets, intervals,
  distances, durations. Anchors the athletic data in a deliberate way.

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale
```css
--text-xs:   0.70rem;   /* phase labels, badges */
--text-sm:   0.825rem;  /* day cell sport pills */
--text-base: 1rem;      /* body, modal descriptions */
--text-lg:   1.125rem;  /* modal workout title */
--text-xl:   1.25rem;   /* section headers */
--text-2xl:  1.5rem;    /* month/year header */
--text-3xl:  1.875rem;  /* app title */
```

### Typography Rules
- Month and year headers: Tenor Sans, `--text-2xl`, natural case
- Weekday column headers (Mon–Sun): Tenor Sans, `--text-xs`, uppercase, tracked `0.08em`
- Phase labels: Tenor Sans, `--text-xs`, uppercase, tracked `0.10em`
- Day numbers: Tenor Sans, `--text-sm`
- Workout pill text in day cells: Libre Baskerville, `--text-xs`, regular weight
- Modal workout title: Tenor Sans, `--text-lg`
- Modal workout body: Libre Baskerville, `--text-base`, line-height 1.75
- Intervals, pace, distances in modal: JetBrains Mono, `--text-sm`
- Never bold Tenor Sans — it has natural elegance at its single weight
- Italic Libre Baskerville for workout notes, coach's tips, rest day copy

---

## Layout & Spacing

**Desktop-first for this app** — training calendars are primarily viewed on a
laptop/monitor while planning. Must still be fully functional at 768px tablet.

### Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

### Calendar Grid
- 7-column grid, full-width
- Day cell min-height: `120px` desktop, `80px` tablet
- Day cell padding: `8px 10px`
- Today's cell: left border `3px solid var(--accent-primary)`, slightly warmer bg
- Empty/rest days: `--bg-secondary`, no border emphasis
- Max calendar width: `1100px`, centered

### Day Cell Design
Each day cell is a quiet field note, not a busy widget:
```css
.day-cell {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 2px;            /* barely rounded — journal feel */
  padding: 8px 10px;
  min-height: 120px;
  cursor: pointer;
  transition: box-shadow 150ms ease, border-color 150ms ease;
}

.day-cell:hover {
  border-color: var(--border-strong);
  box-shadow: 2px 3px 10px var(--shadow);
}
```

### Sport Pills (in day cells)
Small color-coded badges showing the sport(s) for that day:
```css
.sport-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 2px;
  font-family: 'Libre Baskerville', serif;
  font-size: var(--text-xs);
  color: #FAF9F6;
  margin: 2px 2px 0 0;
}
```

---

## Modal Design

The workout detail modal should feel like opening to a page in a training log:

```css
.modal-overlay {
  background: rgba(30, 28, 25, 0.55);
  backdrop-filter: blur(3px);
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  border-radius: 2px;
  box-shadow: 4px 8px 32px var(--shadow-strong);
  max-width: 560px;
  width: 90%;
  padding: 32px 36px;
}
```

Modal anatomy (top to bottom):
1. **Date line** — Tenor Sans, `--text-sm`, `--text-muted`, uppercase tracked
2. **Phase badge** — small pill with phase color and Tenor Sans label
3. **Sport badges** — row of sport-colored pills
4. **Workout title / summary** — Tenor Sans, `--text-lg`
5. **Divider** — `1px solid var(--border)`
6. **Full workout body** — Libre Baskerville, rendered markdown, generous line-height
7. **Intervals/data blocks** — JetBrains Mono for all numeric targets

---

## Phase Banner

Phase banners span full week rows behind the calendar cells:

```css
.phase-banner {
  border-left: 5px solid <phase-color>;
  background: <phase-color> at 8% opacity;
  padding: 4px 12px;
  font-family: 'Tenor Sans', sans-serif;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--text-muted);
}
```

---

## Motion & Animation

- Day cell hover: `box-shadow` lift, `border-color` shift — 150ms ease
- Modal open: fade-in + translateY(8px → 0) — 200ms ease-out
- Modal close: fade-out — 150ms ease-in
- Phase banner: no animation — static, like a label on a map
- No gratuitous transitions. Every motion should feel like turning a page, not a
  notification ping.

```css
* {
  transition: background-color 250ms ease, color 250ms ease,
              border-color 150ms ease;
}
```

---

## Navigation

- Simple header bar: App title (Tenor Sans, `--text-2xl`) left-aligned
- Month navigation: `← March 2026 →` centered, Tenor Sans
- Dark mode toggle: top-right, sun/moon icon, smooth 250ms transition
- No sidebar — the calendar IS the app

---

## Quick Reference — Do / Don't

| Do | Don't |
|---|---|
| Tenor Sans for all headers and labels | Inter, Roboto, or system-ui anywhere |
| Warm limestone/charcoal palette | Arbitrary hex values outside the system |
| `2px` border-radius on all cards and pills | Rounded corners (`12px+`) everywhere |
| JetBrains Mono for all intervals and distances | Libre Baskerville for data/numbers |
| Sport colors applied consistently everywhere | Different shades of the same sport color |
| Phase as a subtle background wash + left border | Phase as a loud banner competing with cells |
| Generous whitespace in modal | Cramped modal with too much content |
| Italic Libre Baskerville for notes and tips | Bold body text as primary emphasis |
| Today highlighted with left border accent | Today with a filled background circle |