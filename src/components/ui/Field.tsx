import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-semibold text-patriot-navy">{label}</div>
        {hint ? <div className="text-xs text-patriot-muted">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <div className={cn('mt-2 text-xs font-semibold text-patriot-red')}>{error}</div>
      ) : null}
    </label>
  )
}

