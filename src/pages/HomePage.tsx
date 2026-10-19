import { ArrowRight, ClipboardCheck, ShieldCheck, Vote } from 'lucide-react'
import { siteCopy } from '../content/siteCopy'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { LinkButton } from '../components/ui/LinkButton'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'

export function HomePage() {
  return (
    <div className="home-page">
      <Reveal>
        <PageHeader
          home
          eyebrow="Presented by citizens who care"
          title={siteCopy.home.heroTitle}
          subtitle={siteCopy.home.heroSubtitle}
          actions={
            <>
              <LinkButton to="/action#pledge" variant="primary">
                Join the pledge <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/paper-ballots" variant="outline">
                Why paper ballots
              </LinkButton>
              <LinkButton to="/request-help" variant="red">
                Request help <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </>
          }
        />
      </Reveal>

      <div className="home-pillars grid gap-0 md:grid-cols-3">
        {[
          { icon: Vote, title: 'Paper ballots', body: siteCopy.home.pillars[0].body },
          { icon: ShieldCheck, title: 'Public counts', body: siteCopy.home.pillars[1].body },
          { icon: ClipboardCheck, title: 'Real audits', body: siteCopy.home.pillars[2].body },
        ].map((p, idx) => (
          <Reveal key={p.title} delay={Math.min(0.06 * idx, 0.18)}>
            <Card className="pillar-card p-7 sm:p-8">
              <CardGlow />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <p.icon className="h-6 w-6 text-patriot-red" />
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-patriot-red">
                    {p.title}
                  </div>
                </div>
                <div className="mt-5 font-display text-3xl font-semibold text-patriot-navy">{p.title}</div>
                <div className="mt-3 text-base leading-relaxed text-patriot-text">{p.body}</div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <Section title="The Mission" kicker="Why we exist">
        <Reveal>
          <Card>
            <CardGlow />
            <div className="relative text-sm leading-relaxed text-patriot-text sm:text-base">
              <p>{siteCopy.home.missionLead}</p>
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section title="Start Here" kicker="Quick actions">
        <div className="action-cards grid gap-5 lg:grid-cols-3">
          <Reveal>
            <Card className="p-6">
              <CardGlow />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-patriot-red">
                  Learn
                </div>
                <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-patriot-navy">
                  Understand your county.
                </div>
                <div className="mt-3 text-sm leading-relaxed text-patriot-text">
                  Know the equipment, the procedures, and what (if any) audits happen after election
                  day.
                </div>
                <div className="mt-6">
                  <LinkButton to="/action" variant="outline">
                    Open toolkit <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="p-6">
              <CardGlow />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-patriot-red">
                  Advocate
                </div>
                <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-patriot-navy">
                  Paper + audits.
                </div>
                <div className="mt-3 text-sm leading-relaxed text-patriot-text">
                  Ask for voter-verifiable paper records, transparent counts, and documented audit
                  plans.
                </div>
                <div className="mt-6">
                  <LinkButton to="/paper-ballots#take-action" variant="primary">
                    Take action <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.16}>
            <Card className="p-6">
              <CardGlow />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-patriot-red">
                  Organize
                </div>
                <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-patriot-navy">
                  Build a local team.
                </div>
                <div className="mt-3 text-sm leading-relaxed text-patriot-text">
                  Observers and meeting attendance move policy. Get coordinated and show up.
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

