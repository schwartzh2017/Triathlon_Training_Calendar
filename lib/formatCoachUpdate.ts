import { Workout, WorkoutLog } from '@/types/workout'

const phaseLabels: Record<string, string> = {
  base: 'Base',
  'race-prep': 'Race Prep',
  taper: 'Taper',
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatCoachUpdate(workout: Workout, log: WorkoutLog): string {
  const dateStr = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const sports = workout.sports
    .map(s => capitalizeFirstLetter(s))
    .join(', ')

  const statusLabel = capitalizeFirstLetter(log.status)

  const lines = [
    `WORKOUT LOG — ${dateStr}`,
    `Phase: ${phaseLabels[workout.phase] ?? capitalizeFirstLetter(workout.phase)}  |  Sports: ${sports}`,
    '',
    `Planned: ${workout.summary}`,
    `Status: ${statusLabel}`,
  ]

  if (log.actualDuration) {
    lines.push(`Actual Duration: ${log.actualDuration}`)
  }

  lines.push(`RPE: ${log.rpe}/10`)

  if (log.notes) {
    lines.push('', `Notes:`, log.notes)
  }

  return lines.join('\n')
}

export { capitalizeFirstLetter }
