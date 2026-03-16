import { ArrowRight } from 'lucide-react'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { LinkButton } from '../components/ui/LinkButton'
import { PageHeader } from '../components/ui/PageHeader'

export function NotFoundPage() {
  return (
    <div>
      <Reveal>
        <PageHeader
          eyebrow="404"
          title="Page not found"
          subtitle="Use the navigation to find paper-ballot resources and local action steps."
          actions={
            <>
              <LinkButton to="/" variant="primary">
                Go home <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/action" variant="outline">
                Action toolkit
              </LinkButton>
            </>
          }
        />
      </Reveal>

      <Reveal delay={0.08}>
        <Card className="mt-10 p-6">
          <CardGlow />
          <div className="relative text-sm leading-relaxed text-patriot-text">
            Tip: start with “Why Paper Ballots” if you’re new, then use the toolkit to take local
            action.
          </div>
        </Card>
      </Reveal>
    </div>
  )
}

