# Triathlon Training Calendar

## Skills
Load before relevant work:
- `.claude/skills/frontend-design-triathlon.md` — all UI/styling work

## Plugins
- `/Users/hschwartz/.claude/plugins/cache/superpowers/.opencode/plugins/superpowers.js`

## Agents
- `.claude/plugins/code-simplifier/agents/code-simplifier.md` — invoke automatically after writing or modifying any component or API route

## Stack
Next.js 14, App Router, TypeScript, Tailwind, gray-matter, remark, date-fns

## Structure
- `/workouts` — daily MD workout files
- `/app/api/workouts/route.ts` — reads workouts, returns JSON

## Workout Frontmatter Schema
\```yaml
date: 2026-03-13
phase: base | race-prep | taper
sports: [swim, bike, run, strength]
summary: One-line summary
title: Workout title
\```