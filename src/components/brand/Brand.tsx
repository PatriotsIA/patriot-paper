import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-9 w-9', className)}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Patriots For Paper"
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#c92539" />
          <stop offset="0.55" stopColor="#ffffff" />
          <stop offset="1" stopColor="#172354" />
        </linearGradient>
      </defs>
      <path
        d="M32 4c10 6 18 7 24 8v21c0 14-9 22-24 27C17 55 8 47 8 33V12c6-1 14-2 24-8Z"
        fill="#ffffff"
        stroke="url(#g)"
        strokeWidth="2"
      />
      <path
        d="M20 21h17c5.2 0 9 3 9 7.8 0 5.2-4.2 7.9-9.6 7.9H20V21Zm7 6v6h8.7c2.1 0 3.3-1.1 3.3-3s-1.2-3-3.3-3H27Z"
        fill="#172354"
        opacity="0.92"
      />
      <path
        d="M22 41h20"
        stroke="#c92539"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('brand-lockup group inline-flex items-center gap-3', className)}>
      <BrandMark className="shrink-0 transition-transform duration-300 group-hover:scale-[1.03]" />
      <div className="leading-tight">
        <div className="font-display text-[27px] font-bold leading-none tracking-tight text-patriot-navy">
          Patriots For Paper
        </div>
        <div className="mt-1.5 text-[11px] font-medium text-patriot-muted">
          Return elections to auditable paper ballots.
        </div>
      </div>
    </Link>
  )
}

