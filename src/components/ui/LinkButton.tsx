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
  primary: 'bg-patriot-blue text-patriot-white shadow-glowBlue hover:brightness-105',
  red: 'bg-patriot-red text-patriot-white shadow-glowRed hover:brightness-105',
  outline:
    'border border-patriot-blue/35 bg-patriot-bg text-patriot-navy hover:border-patriot-blue hover:bg-patriot-bgSoft',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm sm:text-base',
  lg: 'h-12 px-5 text-base',
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
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition will-change-transform hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patriot-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-patriot-bg',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}

