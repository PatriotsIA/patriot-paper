import { lazy, Suspense } from 'react'
import { ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react'
import { siteCopy } from '../content/siteCopy'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { PledgeSection } from '../components/pledges/PledgeSection'
const PledgeMap = lazy(() => import('../components/pledges/PledgeMap'))

export function ActionToolkitPage() {
  return (
    <div className="toolkit-page">
      <Reveal>
        <PageHeader
          eyebrow="Action toolkit"
          title={siteCopy.action.heroTitle}
          subtitle={siteCopy.action.heroSubtitle}
          actions={
            <>
              <a
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-patriot-border bg-patriot-bg px-4 text-sm font-semibold tracking-wide text-patriot-navy transition hover:border-patriot-blue/55 hover:bg-patriot-bgSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-patriot-blue/20 focus-visible:ring-offset-2 focus-visible:ring-offset-patriot-bg"
                href="https://community.patriotsinaction.com/"
                target="_blank"
                rel="noreferrer"
              >
                Join community <ArrowRight className="h-4 w-4" />
              </a>
            </>
          }
        />
      </Reveal>

      <Suspense fallback={<div className="map-section-loading">Loading pledge map…</div>}><PledgeMap /></Suspense>
      <PledgeSection />

      <Section title="Checklist" kicker="Use this on the ground">
        <div className="grid gap-6">
          {siteCopy.action.steps.map((step, idx) => (
            <Reveal key={step.title} delay={Math.min(idx * 0.06, 0.24)}>
              <Card>
                <CardGlow />
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-2xl font-bold tracking-wide text-patriot-navy">
                      {step.title}
                    </h3>
                    <div className="inline-flex items-center gap-2 rounded-full border border-patriot-border bg-patriot-bgSoft px-3 py-1 text-xs font-semibold text-patriot-muted">
                      <ClipboardList className="h-4 w-4" />
                      Step {idx + 1} / {siteCopy.action.steps.length}
                    </div>
                  </div>

                  <ul className="mt-6 grid gap-3 text-sm text-patriot-text sm:text-base">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-patriot-blue" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

    </div>
  )
}
