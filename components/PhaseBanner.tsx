import { Phase, PhaseConfig } from '@/config/phases'

interface PhaseBannerProps {
  phase: PhaseConfig | undefined
}

const phaseColorMap: Record<Phase, string> = {
  'base': 'var(--phase-base)',
  'race-prep': 'var(--phase-race-prep)',
  'taper': 'var(--phase-taper)',
}

export default function PhaseBanner({ phase }: PhaseBannerProps) {
  if (!phase) {
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ borderLeft: '5px solid transparent' }}
      />
    )
  }

  const bgColor = phaseColorMap[phase.name]

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        borderLeft: `5px solid ${bgColor}`,
        backgroundColor: `${bgColor}14`,
      }}
    >
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-xs)] uppercase tracking-[0.10em]"
        style={{ 
          fontFamily: "'Tenor Sans', sans-serif",
          color: 'var(--text-muted)',
        }}
      >
        {phase.label}
      </span>
    </div>
  )
}
