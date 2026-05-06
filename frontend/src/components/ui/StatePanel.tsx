import { MagnifyingGlass, Warning } from '@phosphor-icons/react'

interface StatePanelProps {
  state: 'loading' | 'error' | 'empty'
  message?: string
  onRetry?: () => void
}

export function StatePanel({ state, message, onRetry }: StatePanelProps) {
  if (state === 'loading') {
    return (
      <div className="space-y-3 p-6">
        {[92, 76, 58].map((w) => (
          <div key={w} className="h-4 overflow-hidden bg-signal-wash">
            <div
              className="h-full animate-pulse bg-gradient-to-r from-signal-wash via-white to-signal-wash"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="border border-red-200 bg-red-50 p-5 text-red-900">
        <div className="flex items-center gap-3 font-bold">
          <Warning size={20} weight="bold" />
          {message ?? 'Something went wrong'}
        </div>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 text-sm font-semibold underline">
            Try again
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="border border-dashed border-signal-line bg-signal-wash p-5">
      <div className="flex items-center gap-3 font-bold">
        <MagnifyingGlass size={20} weight="light" className="text-signal-muted" />
        {message ?? 'No records found'}
      </div>
    </div>
  )
}
