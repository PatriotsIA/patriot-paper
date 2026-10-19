import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'outline' | 'red'
type Size = 'sm' | 'md' | 'lg'

export type LinkButtonProps = LinkProps & {
  variant?: Variant
  size?: Size
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-patriot-red text-patriot-white shadow-glowRed hover:bg-patriot-redDark',
  red: 'bg-patriot-navy text-patriot-white shadow-glowBlue hover:bg-patriot-blue',
  outline:
    'border border-patriot-navy/25 bg-patriot-bg text-patriot-navy hover:border-patriot-blue hover:bg-patriot-bgSoft',
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-11 px-4 py-2 text-sm',
  md: 'min-h-12 px-6 py-3 text-base',
  lg: 'min-h-14 px-7 py-3 text-base',
}

export function LinkButton({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-wide transition will-change-transform hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patriot-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-patriot-bg',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}

