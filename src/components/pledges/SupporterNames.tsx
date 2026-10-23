import { useCallback, useEffect, useRef, useState } from 'react'
import { countyById } from '../../lib/geography'
import { fetchSupporters, type PublicSupporter } from '../../lib/pledges'

export function SupporterNames({ county, onClear }: { county: string; onClear: () => void }) {
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1)
    window.addEventListener('pledge-recorded', refresh)
    return () => window.removeEventListener('pledge-recorded', refresh)
  }, [])
  const selected = countyById.get(county)
  return <section className="supporter-names" aria-labelledby="supporter-names-title">
    <div className="supporter-names-heading"><div><h3 id="supporter-names-title">{selected ? `Pledges in ${selected.name}, ${selected.state}` : 'Pledges across all counties'}</h3><p>First names shared by supporters who opted in.</p></div><div className="flex flex-wrap gap-4">{county && <button type="button" className="map-text-button" onClick={onClear}>Show all counties</button>}<button type="button" className="map-text-button" onClick={() => setRevision(value => value + 1)}>Refresh names</button></div></div>
    <NamesList key={`${county}:${revision}`} county={county} />
  </section>
}

function NamesList({ county }: { county: string }) {
  const [items, setItems] = useState<PublicSupporter[]>([])
  const [cursor, setCursor] = useState<string | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scroll = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const request = useRef<AbortController | null>(null)
  const busy = useRef(false)
  const load = useCallback(async () => {
    if (busy.current || cursor === null) return
    busy.current = true
    const controller = new AbortController()
    request.current = controller
    setLoading(true); setError('')
    try {
      const page = await fetchSupporters(county, cursor, controller.signal)
      if (controller.signal.aborted) return
      setItems(current => {
        const ids = new Set(current.map(item => item.id))
        return [...current, ...page.items.filter(item => !ids.has(item.id))]
      })
      setCursor(page.nextCursor)
    } catch {
      if (!controller.signal.aborted) setError('Names could not be loaded. Please try again.')
    } finally {
      if (request.current === controller) { busy.current = false; setLoading(false) }
    }
  }, [county, cursor])
  useEffect(() => {
    if (error || cursor === null || !sentinel.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void load()
    }, { root: scroll.current, rootMargin: '0px 0px 80px 0px' })
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [load, error, cursor])
  useEffect(() => () => { request.current?.abort(); busy.current = false }, [])
  return <div ref={scroll} className="supporter-names-scroll" role="region" aria-label="Pledge first names" tabIndex={0} aria-busy={loading}>
    <ul className="supporter-names-list">{items.map(item => <li key={item.id}><strong>{item.firstName}</strong>{!county && <span>{countyById.get(item.countyFips)?.name}, {countyById.get(item.countyFips)?.state}</span>}</li>)}</ul>
    <div ref={sentinel} className="supporter-names-status" role="status">
      {loading ? 'Loading names…' : error || (cursor === null ? items.length ? 'You’ve reached the end of the list.' : 'No public first names yet. Pledges without name-sharing consent still count on the map.' : '')}
    </div>
    {cursor !== null && <button type="button" className="map-text-button supporter-load" onClick={() => void load()} disabled={loading}>{error ? 'Try again' : 'Load more names'}</button>}
  </div>
}
