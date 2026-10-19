import { type ReactNode } from 'react'
import { Vote } from 'lucide-react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  home = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  home?: boolean
}) {
  return (
    <div className={`page-header${home ? ' page-header-home' : ''}`}>
      <div className="page-header-inner">
        <div className="relative z-10">
          {eyebrow ? <div className="hero-eyebrow">{eyebrow}</div> : null}
          <h1>{title}</h1>
          {subtitle ? <p className="hero-subtitle">{subtitle}</p> : null}
          {actions ? <div className="hero-actions">{actions}</div> : null}
        </div>
        {home ? (
          <div className="hero-emblem" aria-hidden="true">
            <div className="emblem-ring">
              <span className="emblem-stars">✦ &nbsp; ✦ &nbsp; ✦</span>
              <Vote strokeWidth={0.8} />
              <div className="emblem-rule" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
