import emailjs, { EmailJSResponseStatus } from '@emailjs/browser'

type EmailJsEnv = {
  serviceId: string
  templateId: string
  publicKey: string
}

function getEmailJsEnv(): EmailJsEnv {
  const serviceId = (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim()
  const templateId = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim()
  const publicKey = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim()

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'Email sending is not configured. Missing VITE_EMAILJS_* environment variables (restart the dev server after editing `.env`).',
    )
  }

  return { serviceId, templateId, publicKey }
}

function toTemplateValue(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === null || value === undefined) return ''
  return String(value)
}

export type EmailJsMessage = {
  formType: string
  fields: Record<string, unknown>
}

export async function sendEmailJsMessage({ formType, fields }: EmailJsMessage) {
  const { serviceId, templateId, publicKey } = getEmailJsEnv()

  const templateParams: Record<string, string> = {
    form_type: formType,
    submitted_at: new Date().toISOString(),
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, toTemplateValue(v)])),
  }

  try {
    await emailjs.send(serviceId, templateId, templateParams, { publicKey })
  } catch (err) {
    if (err instanceof EmailJSResponseStatus) {
      const originHint =
        typeof window !== 'undefined' && window.location?.origin
          ? ` (origin: ${window.location.origin})`
          : ''
      const hint =
        err.status === 403
          ? `Check EmailJS “Allowed Domains” includes this site${originHint}.`
          : err.status === 400 || err.status === 401
            ? 'Double-check service ID, template ID, and public key.'
            : err.status === 404
              ? 'Service/template not found (verify IDs).'
              : err.status === 429
                ? 'Rate limited — try again in a bit.'
                : err.status === 451
                  ? 'EmailJS blocked a headless browser request.'
                  : ''

      throw new Error(`EmailJS failed (${err.status}): ${err.text}${hint ? ` — ${hint}` : ''}`)
    }
    if (err instanceof Error) throw err
    throw new Error('Email sending failed.')
  }
}

