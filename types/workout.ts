export type Sport = 'swim' | 'bike' | 'run' | 'strength' | 'pilates' | 'plyometrics' | 'sauna' | 'contrast-therapy'

export type Phase = 'base' | 'race-prep' | 'taper'

export interface Workout {
  date: string
  phase: Phase
  sports: Sport[]
  summary: string
  title: string
  body: string
}

export interface WorkoutLog {
  date: string
  status: 'completed' | 'modified' | 'skipped'
  rpe: number
  actualDuration?: string
  notes?: string
}
