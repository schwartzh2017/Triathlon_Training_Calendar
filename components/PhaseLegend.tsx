import { PHASE_COLORS, PHASE_LABELS } from '@/lib/constants'
import { Phase } from '@/types/workout'

const PHASES: Phase[] = ['base', 'race-prep', 'taper']

export default function PhaseLegend() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        marginTop: '12px',
        fontFamily: "'Tenor Sans', sans-serif",
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
      aria-label="Phase legend"
    >
      {PHASES.map(phase => (
        <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: PHASE_COLORS[phase],
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          {PHASE_LABELS[phase]}
        </div>
      ))}
    </div>
  )
}
