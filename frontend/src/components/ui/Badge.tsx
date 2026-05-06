export type Tone = 'default' | 'blue' | 'green' | 'warning' | 'error'

const toneClasses: Record<Tone, string> = {
  default: 'bg-signal-wash text-signal-muted',
  blue: 'bg-signal-blue/10 text-signal-blue',
  green: 'bg-signal-green/10 text-signal-green',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
}

export function Badge({ label, tone = 'default' }: { label: string; tone?: Tone }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}
