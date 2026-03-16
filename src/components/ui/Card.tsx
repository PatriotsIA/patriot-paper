import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-patriot-border bg-patriot-bg p-6 shadow-card',
        className,
      )}
      {...props}
    />
  )
}

export function CardGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(70%_60%_at_30%_10%,black,transparent_70%)]"
      style={{
        background:
          'radial-gradient(520px 260px at 12% 0%, rgba(96,148,225,0.22), transparent 62%), radial-gradient(480px 240px at 88% 0%, rgba(190,30,45,0.14), transparent 60%)',
      }}
    />
  )
}

