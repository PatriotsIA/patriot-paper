import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { siteCopy } from '../../content/siteCopy'
import { Reveal } from '../motion/Reveal'
import { Card, CardGlow } from '../ui/Card'
import { Section } from '../ui/Section'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { sendEmailJsMessage } from '../../lib/emailjs'
import { countiesForState, countyById, states } from '../../lib/geography'
import { recordPledge } from '../../lib/pledges'
import { useHashScroll } from '../../lib/useHashScroll'

type PledgeForm = {
  county: string
  website: string
  state: string
  name: string
  email: string
  role: string
  agreePrivacyPolicy: boolean
}

export function PledgeSection() {
  useHashScroll()

  const empty = useMemo<PledgeForm>(
    () => ({ county: '', website: '', state: '', name: '', email: '', role: '', agreePrivacyPolicy: false }),
    [],
  )
  const [form, setForm] = useState<PledgeForm>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof PledgeForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Partial<Record<keyof PledgeForm, string>> = {}
    if (!form.name.trim()) next.name = 'Required'
    if (!form.email.trim()) next.email = 'Required'
    else if (!validateEmail(form.email)) next.email = 'Enter a valid email'
    if (!states.some((state) => state.code === form.state)) next.state = 'Select your state'
    if (countyById.get(form.county)?.state !== form.state) next.county = 'Select a county in your state'
    if (!form.agreePrivacyPolicy) next.agreePrivacyPolicy = 'Required'
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      const name = form.name.trim()
      const email = form.email.trim()
      const county = countyById.get(form.county)!.name
      const state = form.state.trim()
      const role = form.role.trim()
      const message = [
        'Action pledge submission',
        `Name: ${name}`,
        `Email: ${email}`,
        `County: ${county}`,
        `State: ${state}`,
        role ? `Role: ${role}` : null,
        `Agree privacy policy: Yes`,
      ]
        .filter((line): line is string => Boolean(line))
        .join('\n')

      await recordPledge({ name, email, countyFips: form.county, state, role, agreePrivacyPolicy: form.agreePrivacyPolicy, website: form.website })
      // Storage is authoritative. A notification outage must not lose a saved pledge.
      let emailSent = true
      await sendEmailJsMessage({
        formType: 'action-pledge',
        fields: {
          subject: 'Action pledge',
          message,
          from_name: name,
          from_email: email,
          reply_to: email,
          county,
          county_fips: form.county,
          state,
          ...(role ? { role } : {}),
          agree_privacy_policy: true,
        },
      }).catch(() => { emailSent = false })
      toast.success(emailSent ? 'Thanks — you’re on the pledge list. Our team will receive your details by email.' : 'Your pledge is recorded. The email notification is delayed.')
      setForm(empty)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
      <Section id="pledge" title={siteCopy.action.pledge.title} kicker="Get involved">
        <Reveal>
          <Card>
            <CardGlow />
            <form className="relative grid gap-5" onSubmit={onSubmit}>
              <div className="pledge-honeypot" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} /></label>
              </div>
              <p className="text-sm leading-relaxed text-patriot-text sm:text-base">
                {siteCopy.action.pledge.body}
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Name" hint="Required" error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email" hint="Required" error={errors.email}>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    autoComplete="email"
                    placeholder="you@email.com"
                  />
                </Field>
                <Field label="State" hint="Required" error={errors.state}>
                  <Select value={form.state} onChange={(e) => setForm((s) => ({ ...s, state: e.target.value, county: '' }))}>
                    <option value="">Select your state</option>
                    {states.map((state) => <option key={state.code} value={state.code}>{state.name}</option>)}
                  </Select>
                </Field>
                <Field label="County" hint="Required" error={errors.county}>
                  <Select disabled={!form.state} value={form.county} onChange={(e) => setForm((s) => ({ ...s, county: e.target.value }))} aria-invalid={Boolean(errors.county)}>
                    <option value="">{form.state ? 'Select your county' : 'Select a state first'}</option>
                    {countiesForState(form.state).map((county) => <option key={county.id} value={county.id}>{county.name}</option>)}
                  </Select>
                </Field>
                <Field label="How you want to help">
                  <Select
                    value={form.role}
                    onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                  >
                    <option value="">Select one</option>
                    <option value="Attend meetings">Attend meetings</option>
                    <option value="Public records requests">Public records requests</option>
                    <option value="Volunteer coordination">Volunteer coordination</option>
                    <option value="Poll watcher / observer">Poll watcher / observer</option>
                    <option value="Other">Other</option>
                  </Select>
                </Field>
              </div>

              <div>
                <label className="flex items-start gap-3 rounded-xl border border-patriot-border bg-patriot-bgSoft px-4 py-3 text-sm text-patriot-text">
                  <input
                    type="checkbox"
                    checked={form.agreePrivacyPolicy}
                    onChange={(e) => setForm((s) => ({ ...s, agreePrivacyPolicy: e.target.checked }))}
                    className="mt-1 h-4 w-4 accent-patriot-blue"
                  />
                  <span>
                    I have read and agree to the{' '}
                    <Link
                      className="font-semibold text-patriot-blue underline decoration-patriot-blue/30 underline-offset-2"
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link
                      className="font-semibold text-patriot-blue underline decoration-patriot-blue/30 underline-offset-2"
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms &amp; Conditions
                    </Link>
                    .
                  </span>
                </label>
                {errors.agreePrivacyPolicy ? (
                  <div className="mt-2 text-xs font-semibold text-patriot-red">{errors.agreePrivacyPolicy}</div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-patriot-muted">Submissions are sent to our team by email.</div>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Join pledge'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </Reveal>
      </Section>
  )
}
