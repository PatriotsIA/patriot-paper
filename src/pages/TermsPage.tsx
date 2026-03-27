import { Link } from 'react-router-dom'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { CONTACT_EMAIL } from '../config/contact'

const org = 'Patriots For Paper'
const lastRevised = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export function TermsPage() {
  return (
    <div>
      <Reveal>
        <PageHeader
          eyebrow="Legal"
          title="Terms &amp; conditions"
          subtitle={`Terms for ${org} website and online services.`}
        />
      </Reveal>

      <Section title="Terms" kicker={lastRevised}>
        <Reveal>
          <Card>
            <CardGlow />
            <div className="relative space-y-6 text-sm leading-relaxed text-patriot-text sm:text-base">
              <p>
                These Terms and Conditions (&quot;Terms&quot;) apply to your use of the websites and online services (&quot;Services&quot;)
                provided by {org}. By using the Services, you agree to these Terms. If you do not agree, do not use the
                Services.
              </p>
              <p>
                Questions:{' '}
                <a className="font-semibold text-patriot-blue underline" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">Privacy policy</h2>
                <p>
                  See our{' '}
                  <Link className="font-semibold text-patriot-blue underline" to="/privacy">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">Mobile communications</h2>
                <p>
                  If you subscribe to receive messages or calls, you consent to receive automated messages from us via your
                  mobile device. Subscribers may receive multiple messages a week from us, depending on the program you join.
                </p>
                <p>
                  We do not charge for these services; your carrier&apos;s rates and fees apply. You may text STOP to cancel
                  or HELP for support. Carriers are not liable for delayed or undelivered messages.
                </p>
                <p>
                  By entering your phone number and selecting to opt in, you consent to join a recurring SMS/MMS program
                  that may provide alerts, updates, and other information. No consent is required to purchase goods or
                  services. Msg &amp; data rates may apply. Reply HELP for help or STOP to opt-out. SMS information is not
                  rented, sold, or shared. See our{' '}
                  <Link className="font-semibold text-patriot-blue underline" to="/privacy">
                    Privacy Policy
                  </Link>{' '}
                  and these Terms.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">Disclaimer</h2>
                <p>
                  THE SERVICES ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY
                  LAW, WE DISCLAIM LIABILITY FOR INDIRECT OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </Section>
    </div>
  )
}
