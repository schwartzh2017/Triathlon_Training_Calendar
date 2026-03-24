import { Sport, Phase } from '@/types/workout'

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

export const PHASE_COLORS: Record<Phase, string> = {
  base: 'var(--phase-base)',
  'race-prep': 'var(--phase-race-prep)',
  taper: 'var(--phase-taper)',
}

export const PHASE_LABELS: Record<Phase, string> = {
  base: 'Base',
  'race-prep': 'Race Prep',
  taper: 'Taper',
}

export const LOG_STATUSES = ['completed', 'modified', 'skipped'] as const
