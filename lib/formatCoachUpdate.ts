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
