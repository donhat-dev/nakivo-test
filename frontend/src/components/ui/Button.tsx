import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  tone?: 'primary' | 'secondary' | 'danger'
  arrow?: boolean
  children: ReactNode
}

const toneClasses: Record<string, string> = {
  primary: 'bg-signal-blue text-white shadow-[0_24px_60px_-36px_rgba(0,76,255,0.72)]',
  secondary: 'border border-signal-line bg-white text-signal-ink',
  danger: 'bg-red-600 text-white',
}

export function Button({ tone = 'primary', arrow = false, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`group inline-flex items-center justify-between gap-5 px-5 py-3 text-sm font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${toneClasses[tone]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {arrow && (
        <span
          className={`grid size-8 place-items-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 ${
            tone === 'primary' ? 'bg-white/16' : 'bg-signal-wash'
          }`}
        >
          <ArrowUpRight size={16} weight="bold" />
        </span>
      )}
    </button>
  )
}
