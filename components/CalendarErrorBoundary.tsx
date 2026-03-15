'use client'

import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class CalendarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Calendar render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="max-w-[1100px] mx-auto flex flex-col items-center justify-center min-h-[400px] gap-4"
          style={{ fontFamily: "'Tenor Sans', sans-serif" }}
        >
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Unable to load calendar
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '10px 24px',
              background: 'var(--accent-primary)',
              border: 'none',
              color: 'var(--text-on-badge)',
              fontFamily: "'Tenor Sans', sans-serif",
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
