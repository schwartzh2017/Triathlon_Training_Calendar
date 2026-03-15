export default function Loading() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-[1100px] mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton h-8 w-40 rounded-[2px]" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-8 rounded-[2px]" />
            <div className="skeleton h-8 w-8 rounded-[2px]" style={{ animationDelay: '0.1s' }} />
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0 mb-px">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-8"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>

        {/* Calendar grid skeleton */}
        <div className="grid grid-cols-7 gap-px bg-[var(--border)]">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[120px] p-[8px_10px]"
              style={{ background: 'var(--bg-card)' }}
            >
              {/* Day number */}
              <div
                className="skeleton w-6 h-5 rounded-[2px] mb-2"
                style={{ animationDelay: `${(i % 7) * 0.05}s` }}
              />
              {/* Fake pills — only some cells */}
              {i % 3 !== 0 && (
                <div className="flex gap-1 flex-wrap">
                  <div
                    className="skeleton h-4 w-10 rounded-[2px]"
                    style={{ animationDelay: `${0.2 + (i % 7) * 0.05}s` }}
                  />
                  {i % 5 === 0 && (
                    <div
                      className="skeleton h-4 w-8 rounded-[2px]"
                      style={{ animationDelay: `${0.35 + (i % 7) * 0.05}s` }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
