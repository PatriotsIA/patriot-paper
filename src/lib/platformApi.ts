const baseUrl = (import.meta.env.VITE_PLATFORM_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

export const PLATFORM_SITE_KEY = 'patriot-paper' as const

export type PlatformSubmissionResponse = {
  id: string
  siteKey: string
  submissionType: string
  status: string
  createdAt: string
}

function parseErrorMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string') {
    return (data as { message: string }).message
  }
  return 'Submission failed.'
}

export async function submitPlatformForm(
  submissionType: 'action-pledge' | 'request-help',
  body: Record<string, unknown>,
): Promise<PlatformSubmissionResponse> {
  const url = `${baseUrl}/v1/public/sites/${PLATFORM_SITE_KEY}/submissions/${submissionType}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseErrorMessage(data))
  }

  return data as PlatformSubmissionResponse
}
