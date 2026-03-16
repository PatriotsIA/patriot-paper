import { ArrowRight } from 'lucide-react'
import { siteCopy } from '../content/siteCopy'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { LinkButton } from '../components/ui/LinkButton'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'

export function AboutPage() {
  return (
    <div>
      <Reveal>
        <PageHeader
          eyebrow="About & support"
          title={siteCopy.about.heroTitle}
          subtitle={siteCopy.about.heroSubtitle}
          actions={
            <>
              <LinkButton to="/action#pledge" variant="primary">
                Join the pledge <ArrowRight className="h-4 w-4" />
              </LinkButton>
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

      <Section title="Why this matters" kicker="Our story">
        <Reveal>
          <Card>
            <CardGlow />
            <div className="relative space-y-4 text-sm leading-relaxed text-patriot-text sm:text-base">
              {siteCopy.about.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section title="How to support" kicker="Show up locally">
        <Reveal>
          <Card className="p-6">
            <CardGlow />
            <div className="relative space-y-4 text-sm leading-relaxed text-patriot-text sm:text-base">
              {siteCopy.about.support.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton to="/action" variant="outline">
                  Open toolkit
                </LinkButton>
                <LinkButton to="/request-help" variant="red">
                  Request help <ArrowRight className="h-4 w-4" />
                </LinkButton>
              </div>
            </div>
          </Card>
        </Reveal>
      </Section>
    </div>
  )
}

