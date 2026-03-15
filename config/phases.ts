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

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day) // local midnight, no UTC offset issue
}

export function getPhaseForWeek(weekDates: Date[]): PhaseConfig | undefined {
  if (weekDates.length === 0) {
    return undefined
  }

  const phaseCounts = phases.map(phase => {
    const start = parseLocalDate(phase.startDate)
    const end = parseLocalDate(phase.endDate)
    const count = weekDates.filter(date => date >= start && date <= end).length
    return { phase, count }
  })
  
  const sorted = phaseCounts.sort((a, b) => b.count - a.count)
  return sorted[0]?.count > 0 ? sorted[0].phase : undefined
}
