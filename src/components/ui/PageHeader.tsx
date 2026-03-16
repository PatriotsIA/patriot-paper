import { type ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="relative mx-auto max-w-4xl text-center">
      {eyebrow ? (
        <div className="text-xs font-bold uppercase tracking-[0.28em] text-patriot-red">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-wide text-patriot-navy sm:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-patriot-text sm:text-lg">
          {subtitle}
        </p>
      ) : null}
      {actions ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>
      ) : null}
      <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-patriot-border to-transparent" />
    </div>
  )
}

