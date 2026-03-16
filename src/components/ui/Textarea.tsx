import { type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[120px] w-full resize-y rounded-lg border border-patriot-border bg-patriot-bg px-3 py-3 text-sm text-patriot-text placeholder:text-patriot-muted/70 outline-none transition focus:border-patriot-blue focus:ring-2 focus:ring-patriot-blue/20',
        className,
      )}
      {...props}
    />
  )
}

