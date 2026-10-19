import { type ReactNode } from 'react'

export function Section({
  id,
  title,
  kicker,
  children,
}: {
  id?: string
  title: string
  kicker?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="content-section mt-16 scroll-mt-40 sm:mt-20">
      <div className="section-heading flex flex-col gap-3">
        {kicker ? (
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-patriot-red">
            {kicker}
          </div>
        ) : null}
        <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-patriot-navy sm:text-5xl">
          {title}
        </h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

