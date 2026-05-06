import type { ComponentPropsWithoutRef, ReactNode } from 'react'

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  innerClass?: string
  children: ReactNode
}

export function Card({ children, className = '', innerClass = '', ...props }: CardProps) {
  return (
    <div className={`bezel ${className}`} {...props}>
      <div className={`bezel-core h-full ${innerClass}`}>{children}</div>
    </div>
  )
}
