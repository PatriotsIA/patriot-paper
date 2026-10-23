import config from '../config/pledge-api.json'
import { countyById } from './geography'

const baseUrl = (import.meta.env.VITE_PLEDGE_API_URL || config.url).replace(/\/$/, '')
export type Pledge = { publishFirstName: boolean; publicFirstName: string; name: string; email: string; countyFips: string; state: string; role: string; agreePrivacyPolicy: boolean; website: string }
export type PledgeCounts = { counties: Record<string, number>; total: number; countiesRepresented: number; updatedAt: string | null; asOf: string }

async function api(path: string, options: RequestInit) {
  if (!baseUrl) throw new Error('Pledges are temporarily unavailable. Please try again shortly.')
  const response = await fetch(`${baseUrl}${path}`, { ...options, cache: 'no-store' })
  const result: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof result === 'object' && result && 'message' in result && typeof result.message === 'string' ? result.message : 'Pledges are temporarily unavailable. Please try again shortly.'
    throw new Error(message)
  }
  return result
}

export async function recordPledge(pledge: Pledge) {
  const result = await api('/pledges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pledge), signal: AbortSignal.timeout(20000) })
  if (!result || typeof result !== 'object' || !('accepted' in result) || result.accepted !== true) throw new Error('Your pledge could not be confirmed. Please try again.')
  window.dispatchEvent(new CustomEvent('pledge-recorded', { detail: { countyFips: pledge.countyFips } }))
}

export async function fetchPledgeCounts(signal: AbortSignal): Promise<PledgeCounts> {
  const data = await api('/counts', { signal })
  if (!data || typeof data !== 'object' || !('counties' in data) || !data.counties || typeof data.counties !== 'object' || Array.isArray(data.counties)) throw new Error('County totals could not be loaded.')
  const entries = Object.entries(data.counties)
  if (entries.some(([id, count]) => !countyById.has(id) || !Number.isSafeInteger(count) || (count as number) < 0)) throw new Error('County totals could not be loaded.')
  const counts = Object.fromEntries(entries) as Record<string, number>
  // Derive summary values from the same snapshot as the map so they always agree.
  return { counties: counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0), countiesRepresented: Object.values(counts).filter((count) => count > 0).length, updatedAt: 'updatedAt' in data && typeof data.updatedAt === 'string' ? data.updatedAt : null, asOf: 'asOf' in data && typeof data.asOf === 'string' ? data.asOf : new Date().toISOString() }
}

export type PublicSupporter = { id: string; firstName: string; countyFips: string }
export async function fetchSupporters(county: string, cursor: string | undefined, signal: AbortSignal): Promise<{ items: PublicSupporter[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ limit: '40' })
  if (county) params.set('county', county)
  if (cursor) params.set('cursor', cursor)
  const data = await api(`/supporters?${params}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) })
  if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items) || !('nextCursor' in data) || !(data.nextCursor === null || typeof data.nextCursor === 'string')) throw new Error('Names unavailable')
  if (data.items.some(item => !item || typeof item.id !== 'string' || typeof item.firstName !== 'string' || !countyById.has(item.countyFips) || (county && county !== item.countyFips))) throw new Error('Names unavailable')
  return { items: data.items, nextCursor: data.nextCursor }
}
