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
    <section id={id} className="mt-14 scroll-mt-28">
      <div className="flex flex-col gap-2">
        {kicker ? (
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-patriot-red">
            {kicker}
          </div>
        ) : null}
        <h2 className="font-display text-2xl font-bold tracking-wide text-patriot-navy sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

