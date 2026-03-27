import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { CONTACT_EMAIL } from '../config/contact'

const org = 'Patriots For Paper'
const effective = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export function PrivacyPage() {
  return (
    <div>
      <Reveal>
        <PageHeader
          eyebrow="Legal"
          title="Privacy policy"
          subtitle={`Privacy Policy for ${org} website — structured for counsel review and aligned with common political / civic site texting worksheet expectations.`}
        />
      </Reveal>

      <Section title="Privacy Policy" kicker={effective}>
        <Reveal>
          <Card>
            <CardGlow />
            <div className="relative space-y-8 text-sm leading-relaxed text-patriot-text sm:text-base">
              <p>
                {org} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy of visitors and users
                (&quot;you&quot; or &quot;your&quot;) of our website. This Privacy Policy outlines our practices regarding the collection,
                use, and disclosure of personal information through our website. By accessing and using our website, you
                consent to the terms of this Privacy Policy.
              </p>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">1. Information we collect</h2>
                <p className="font-semibold text-patriot-navy">a) Personal information</p>
                <p>
                  We may collect personal information you voluntarily provide, such as your name, email address, phone
                  number, county, state, and other information you submit through our forms.
                </p>
                <p className="font-semibold text-patriot-navy">b) Text messaging opt-in data</p>
                <p>
                  If you opt in to receive text messages from us, we may collect your phone number and related data
                  required for text messaging services.
                </p>
                <p className="font-semibold text-patriot-navy">c) Automatically collected information</p>
                <p>
                  When you visit our website, we may automatically collect certain information about your device, browser,
                  and usage patterns, including IP addresses, cookies, and similar technologies when enabled.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">2. Use of information</h2>
                <p className="font-semibold text-patriot-navy">a) General uses</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>To communicate with you, respond to inquiries, and provide civic education materials;</li>
                  <li>To send updates, action alerts, and occasional fundraising or event messages you have opted into;</li>
                  <li>To analyze and improve our website;</li>
                  <li>To comply with legal obligations and enforce our agreements.</li>
                </ul>
                <p className="font-semibold text-patriot-navy">b) Text messaging opt-in data</p>
                <p>
                  Your phone number and related data collected for text messaging will only be used to send you messages
                  you have consented to receive in connection with our programs.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">3. Sharing of information</h2>
                <p className="font-semibold text-patriot-navy">a) General</p>
                <p>
                  <strong className="text-patriot-navy">
                    We will not share, sell, rent, or disclose your personal information to any third parties,
                  </strong>{' '}
                  except as described in this Privacy Policy or when required by law. We may use service providers (for
                  example hosting, form processing, email, or SMS vendors) solely to perform services on our behalf under
                  confidentiality and data-processing terms consistent with this Policy.
                </p>
                <p className="font-semibold text-patriot-navy">b) Text messaging opt-in data</p>
                <p>
                  <strong className="text-patriot-navy">
                    We will not share or sell your text messaging opt-in data, consent, or related personal information
                    with any third parties,
                  </strong>{' '}
                  unless required by law.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">4. Data security</h2>
                <p>
                  We take reasonable measures to protect personal information. No method of transmission over the internet
                  is completely secure.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">5. Third-party services</h2>
                <p>
                  Our site may link to third parties. We are not responsible for their privacy practices; please read
                  their policies.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">6. Children&apos;s privacy</h2>
                <p>
                  Our website is not intended for individuals under 13. We do not knowingly collect their personal
                  information.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">7. Updates</h2>
                <p>We may update this Privacy Policy; changes are effective upon posting.</p>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold tracking-wide text-patriot-navy">8. Contact us</h2>
                <p>
                  Questions:{' '}
                  <a className="font-semibold text-patriot-blue underline" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </Section>
    </div>
  )
}
