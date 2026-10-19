import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'content-card relative overflow-hidden rounded-sm border border-patriot-border bg-patriot-bg p-6 shadow-card',
        className,
      )}
      {...props}
    />
  )
}

// Kept as a shared decorative hook; the paper treatment needs no gradient overlay.
export function CardGlow() {
  return null
}
