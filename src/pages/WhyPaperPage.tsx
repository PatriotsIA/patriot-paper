import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { siteCopy } from '../content/siteCopy'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { LinkButton } from '../components/ui/LinkButton'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { useHashScroll } from '../lib/useHashScroll'

export function WhyPaperPage() {
  useHashScroll()

  return (
    <div>
      <Reveal>
        <PageHeader
          eyebrow="Why it matters"
          title={siteCopy.whyPaper.heroTitle}
          subtitle={siteCopy.whyPaper.heroSubtitle}
          actions={
            <>
              <LinkButton to="/action" variant="outline">
                Open toolkit
              </LinkButton>
              <LinkButton to="/action#pledge" variant="primary">
                Join the pledge <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </>
          }
        />
      </Reveal>

      <Section title="The case for paper ballots" kicker="Proof, not trust">
        <Reveal>
          <Card>
            <CardGlow />
            <div className="relative">
              <ul className="grid gap-3 text-sm text-patriot-text sm:text-base">
                {siteCopy.whyPaper.points.map((b) => (
                  <li key={b} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-patriot-blue" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-semibold text-patriot-navy">{siteCopy.whyPaper.actionLine}</p>
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section id="take-action" title="Take action locally" kicker="Show up, ask, document">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Card className="p-6">
              <CardGlow />
              <div className="relative">
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-patriot-red">
                  Meetings
                </div>
                <div className="mt-3 font-display text-2xl font-bold tracking-wide text-patriot-navy">
                  Decisions are made in public.
                </div>
                <div className="mt-3 text-sm leading-relaxed text-patriot-text">
                  County commissioners, election administrators, and local boards set procurement
                  and process. Be there early, not after contracts are signed.
                </div>
                <div className="mt-6">
                  <LinkButton to="/action" variant="outline">
                    See the checklist <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="p-6">
              <CardGlow />
              <div className="relative">
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-patriot-red">
                  Help
                </div>
                <div className="mt-3 font-display text-2xl font-bold tracking-wide text-patriot-navy">
                  Organize with support.
                </div>
                <div className="mt-3 text-sm leading-relaxed text-patriot-text">
                  If you need help understanding your county’s process or building an advocacy
                  team, we can help you get started.
                </div>
                <div className="mt-6">
                  <LinkButton to="/request-help" variant="red">
                    Request help <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>
    </div>
  )
}

