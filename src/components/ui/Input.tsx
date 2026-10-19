import { type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-sm border border-patriot-border bg-patriot-bg px-3 text-base text-patriot-text placeholder:text-patriot-muted/70 outline-none transition focus:border-patriot-blue focus:ring-2 focus:ring-patriot-blue/20',
        className,
      )}
      {...props}
    />
  )
}

