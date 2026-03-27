import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { siteCopy } from '../content/siteCopy'
import { Reveal } from '../components/motion/Reveal'
import { Card, CardGlow } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Section } from '../components/ui/Section'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { submitPlatformForm } from '../lib/platformApi'
import { EnSpotSmsOptInLabel } from '../components/compliance/EnSpotSmsOptInLabel'

type HelpForm = {
  name: string
  email: string
  phone: string
  county: string
  state: string
  goal: string
  notes: string
  agreePrivacyPolicy: boolean
  smsConsent: boolean
}

export function RequestHelpPage() {
  const empty = useMemo<HelpForm>(
    () => ({
      name: '',
      email: '',
      phone: '',
      county: '',
      state: 'TX',
      goal: '',
      notes: '',
      agreePrivacyPolicy: false,
      smsConsent: false,
    }),
    [],
  )
  const [form, setForm] = useState<HelpForm>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof HelpForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  function validateEmail(email: string) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Partial<Record<keyof HelpForm, string>> = {}
    if (!form.name.trim()) next.name = 'Required'
    if (!form.email.trim()) next.email = 'Required'
    else if (!validateEmail(form.email)) next.email = 'Enter a valid email'
    if (!form.county.trim()) next.county = 'Required'
    if (!form.agreePrivacyPolicy) next.agreePrivacyPolicy = 'Required'
    if (form.phone.trim() && !form.smsConsent) next.smsConsent = 'Required when a phone number is provided'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      await submitPlatformForm('request-help', {
        name: form.name.trim(),
        email: form.email.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim(), smsConsent: true } : {}),
        county: form.county.trim(),
        state: form.state.trim(),
        ...(form.goal.trim() ? { goal: form.goal.trim() } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        agreePrivacyPolicy: true,
      })
      toast.success('Request received. Our team will get an email with your details and follow up soon.')
      setForm(empty)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Reveal>
        <PageHeader
          eyebrow="Request help"
          title={siteCopy.requestHelp.heroTitle}
          subtitle={siteCopy.requestHelp.heroSubtitle}
        />
      </Reveal>

      <Section title="What we can help with" kicker="Support options">
        <Reveal>
          <Card>
            <CardGlow />
            <div className="relative">
              <ul className="grid gap-3 text-sm text-patriot-text sm:text-base">
                {siteCopy.requestHelp.helpWith.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-patriot-blue" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section title="Request Help Form" kicker="Tell us your county">
        <Reveal>
          <Card>
            <CardGlow />
            <form className="relative grid gap-5" onSubmit={onSubmit}>
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
                <Field label="Phone (optional)">
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="County" hint="Required" error={errors.county}>
                  <Input
                    value={form.county}
                    onChange={(e) => setForm((s) => ({ ...s, county: e.target.value }))}
                    placeholder="e.g., Randall County"
                  />
                </Field>
                <Field label="State">
                  <Select
                    value={form.state}
                    onChange={(e) => setForm((s) => ({ ...s, state: e.target.value }))}
                  >
                    <option value="TX">Texas</option>
                    <option value="OK">Oklahoma</option>
                    <option value="NM">New Mexico</option>
                    <option value="CO">Colorado</option>
                    <option value="Other">Other</option>
                  </Select>
                </Field>
                <Field label="Your primary goal">
                  <Select
                    value={form.goal}
                    onChange={(e) => setForm((s) => ({ ...s, goal: e.target.value }))}
                  >
                    <option value="">Select one</option>
                    <option value="Paper ballots policy">Paper ballots policy</option>
                    <option value="Audit policy">Audit policy</option>
                    <option value="Observer recruitment">Observer recruitment</option>
                    <option value="Records requests">Records requests</option>
                    <option value="Other">Other</option>
                  </Select>
                </Field>
              </div>

              <Field label="Notes">
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                  placeholder="What’s happening in your county? What have you tried so far?"
                />
              </Field>

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

              {form.phone.trim() ? (
                <div>
                  <label className="flex items-start gap-3 rounded-xl border border-patriot-border bg-patriot-bgSoft px-4 py-3 text-sm text-patriot-text">
                    <input
                      type="checkbox"
                      checked={form.smsConsent}
                      onChange={(e) => setForm((s) => ({ ...s, smsConsent: e.target.checked }))}
                      className="mt-1 h-4 w-4 accent-patriot-blue"
                    />
                    <span>
                      <EnSpotSmsOptInLabel
                        organizationName="Patriots For Paper"
                        purposePhrase="informational, action-related, and donation-related"
                      />
                    </span>
                  </label>
                  {errors.smsConsent ? (
                    <div className="mt-2 text-xs font-semibold text-patriot-red">{errors.smsConsent}</div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-patriot-muted">Submissions are sent securely to the Patriots Platform API.</div>
                <Button type="submit" variant="red" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Submit request'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </Reveal>
      </Section>
    </div>
  )
}

