import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, MapPin, Minus, Plus, RefreshCw, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { counties, countyById, searchCounties, stateByCode, states } from '../../lib/geography'
import { useHashScroll } from '../../lib/useHashScroll'
import { usePledgeCounts } from '../../lib/usePledgeCounts'

type Shape = { id: string; d: string; center: [number, number]; bounds: [number, number, number, number] }
type MapGeometry = { counties: Shape[]; states: Shape[] }
const geometryCache = new Map<string, MapGeometry>()
const format = (value: number) => value.toLocaleString('en-US')
const fullView = { x: 0, y: 0, width: 1000, height: 650 }

export default function PledgeMap() {
  useHashScroll()
  const { data, error, loading, refresh } = usePledgeCounts()
  const [state, setState] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [hovered, setHovered] = useState('')
  const [geometry, setGeometry] = useState<MapGeometry | null>(null)
  const [mapError, setMapError] = useState(false)
  const [mapAttempt, setMapAttempt] = useState(0)
  const [limit, setLimit] = useState(50)
  const [view, setView] = useState(fullView)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x: number; y: number; view: typeof fullView; moved: boolean; county: string | null } | null>(null)
  const ignoreClick = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    const url = state ? `/maps/states/${state}.json` : '/maps/us-counties.json'
    async function load() {
      setGeometry(null); setMapError(false)
      try {
        let next = geometryCache.get(url)
        if (!next) {
          const response = await fetch(url, { signal: controller.signal })
          if (!response.ok) throw new Error('Map unavailable')
          next = await response.json() as MapGeometry
          if (!Array.isArray(next.counties) || !Array.isArray(next.states)) throw new Error('Map unavailable')
          geometryCache.set(url, next)
        }
        if (!controller.signal.aborted) setGeometry(next)
      } catch { if (!controller.signal.aborted) setMapError(true) }
    }
    void load()
    return () => controller.abort()
  }, [state, mapAttempt])

  function changeState(code: string) { setState(code); setSelected(''); setHovered(''); setView(fullView); setLimit(50) }
  function chooseCounty(id: string) {
    const county = countyById.get(id)
    if (!county) return
    if (state !== county.state) { setState(county.state); setView(fullView) }
    setSelected(id); setHovered(''); setLimit(50)
  }
  useEffect(() => {
    const onPledge = (event: Event) => {
      const id = (event as CustomEvent<{ countyFips: string }>).detail.countyFips
      const county = countyById.get(id)
      if (county) { setState(county.state); setSelected(id); setQuery(''); setView(fullView) }
    }
    window.addEventListener('pledge-recorded', onPledge)
    return () => window.removeEventListener('pledge-recorded', onPledge)
  }, [])

  const matching = useMemo(() => searchCounties(query, state).sort((a, b) => ((data?.counties[b.id] ?? 0) - (data?.counties[a.id] ?? 0)) || a.name.localeCompare(b.name) || a.state.localeCompare(b.state)), [query, state, data])
  const scope = useMemo(() => counties.filter((county) => !state || county.state === state), [state])
  const total = data ? scope.reduce((sum, county) => sum + (data.counties[county.id] ?? 0), 0) : null
  const represented = data ? scope.filter((county) => (data.counties[county.id] ?? 0) > 0).length : null
  const max = data ? Math.max(1, ...scope.map((county) => data.counties[county.id] ?? 0)) : 1
  const active = countyById.get(hovered || selected)
  const activeCount = active && data ? data.counties[active.id] ?? 0 : null
  const stateName = stateByCode.get(state)?.name
  const currentShapes = geometry?.counties.filter((shape) => !state || countyById.get(shape.id)?.state === state)
  function fill(id: string) {
    if (!data) return '#eeeff3'
    const count = data.counties[id] ?? 0
    if (!count) return '#ffffff'
    return `hsl(353 68% ${49 - 15 * Math.sqrt(count / max)}%)`
  }
  function zoom(factor: number) {
    setView((previous) => {
      const width = Math.max(180, Math.min(1000, previous.width * factor))
      if (width === 1000) return fullView
      const height = width * .65
      return { x: Math.max(0, Math.min(1000 - width, previous.x + (previous.width - width) / 2)), y: Math.max(0, Math.min(650 - height, previous.y + (previous.height - height) / 2)), width, height }
    })
  }

  return (
    <section className="pledge-map-section" id="pledge-map" aria-labelledby="pledge-map-title">
      <div className="pledge-map-heading">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-patriot-red">Live county totals</p>
          <h2 id="pledge-map-title" className="mt-3 font-display text-4xl font-semibold leading-tight text-patriot-navy sm:text-5xl">Paper ballot supporters. Across America.</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-patriot-muted">Every county starts at zero. Each new pledge adds to its county’s total. Explore a state or find your county. Names and email addresses stay private.</p>
        </div>
        <dl className="pledge-stats" aria-label={stateName ? `${stateName} pledge totals` : 'United States pledge totals'}>
          <div><dt>Pledges{state ? ` · ${state}` : ''}</dt><dd>{total === null ? '—' : format(total)}</dd></div>
          <div><dt>Counties represented</dt><dd>{represented === null ? '—' : format(represented)} <span>/ {format(scope.length)}</span></dd></div>
        </dl>
      </div>
      <div className="pledge-map-toolbar">
        <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-patriot-navy">
          Explore a state
          <select aria-label="Explore a state" value={state} onChange={(event) => changeState(event.target.value)} className="h-11 max-w-full rounded-sm border border-patriot-border bg-white px-3">
            <option value="">United States · all counties</option>
            {states.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {state && <button className="map-text-button" onClick={() => { changeState(''); setQuery('') }}><ArrowLeft size={16} /> All states</button>}
          <button className="map-text-button" onClick={() => void refresh()} disabled={loading} aria-label="Refresh pledge totals"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        </div>
      </div>
      {error && <div role="status" className="mb-4 border-l-4 border-patriot-red bg-white p-4 text-sm">{error} {data ? 'Showing the last available totals.' : 'Totals are unavailable, not zero.'} <button className="font-semibold underline" onClick={() => void refresh()}>Try again</button></div>}
      <div className="pledge-map-grid">
        <div>
          <div className="county-map-frame">
            <div className="county-map-caption"><span>{stateName || 'United States'}</span><span>{state ? 'Select a county to see its total' : 'Select a county to explore its state'}</span></div>
            <div className="county-map-canvas" aria-busy={!geometry && !mapError}>
              {!geometry && <div className="map-loading" role="status">{mapError ? <span>Map unavailable. County totals are still searchable below. <button onClick={() => setMapAttempt((value) => value + 1)} className="underline">Retry map</button></span> : 'Loading county map…'}</div>}
              {geometry && <svg ref={svgRef} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="group" aria-label={`${stateName || 'United States'} county pledge map. All counties are also available in the searchable list.`} className={view.width < 1000 ? 'is-zoomed' : ''}
                onPointerDown={(event) => {
                  if (view.width === 1000) return
                  drag.current = { x: event.clientX, y: event.clientY, view, moved: false, county: (event.target as Element).closest('[data-county]')?.getAttribute('data-county') ?? null }; ignoreClick.current = false
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                onPointerMove={(event) => {
                  const start = drag.current
                  if (!start) return
                  const scale = start.view.width / event.currentTarget.getBoundingClientRect().width
                  const dx = (event.clientX - start.x) * scale, dy = (event.clientY - start.y) * scale
                  if (Math.abs(dx) + Math.abs(dy) > 3) start.moved = true
                  setView({ ...start.view, x: Math.max(0, Math.min(1000 - start.view.width, start.view.x - dx)), y: Math.max(0, Math.min(650 - start.view.height, start.view.y - dy)) })
                }}
                onPointerUp={(event) => { if (drag.current) { const start = drag.current; ignoreClick.current = true; drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId); if (!start.moved && start.county) chooseCounty(start.county) } }}
                onPointerCancel={() => { drag.current = null }}>
                {currentShapes?.map((shape) => {
                  const county = countyById.get(shape.id)
                  if (!county) return null
                  const count = data ? data.counties[shape.id] ?? 0 : null
                  return <path key={shape.id} d={shape.d} data-county={shape.id} fill={fill(shape.id)} stroke={shape.id === selected || shape.id === hovered ? '#172354' : '#7e89a6'} strokeWidth={shape.id === selected || shape.id === hovered ? 2 : .55} vectorEffect="non-scaling-stroke" onMouseEnter={() => setHovered(shape.id)} onMouseLeave={() => setHovered('')} onClick={() => { if (!ignoreClick.current) chooseCounty(shape.id); ignoreClick.current = false }}><title>{county.name}, {county.state}: {count === null ? 'totals unavailable' : `${format(count)} pledges`}</title></path>
                })}
                {!state && geometry.states.map((shape) => <path key={shape.id} d={shape.d} fill="none" stroke="#172354" strokeWidth={.9} vectorEffect="non-scaling-stroke" pointerEvents="none" />)}
                {state && currentShapes?.filter((shape) => (shape.bounds[2] - shape.bounds[0]) / view.width * 1000 > 21 && (shape.bounds[3] - shape.bounds[1]) / view.width * 1000 > 18).map((shape) => <text key={shape.id} x={shape.center[0]} y={shape.center[1]} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(3, 11 * view.width / 1000)} fontWeight="700" fill={data && data.counties[shape.id] ? '#fff' : '#172354'} pointerEvents="none">{data ? format(data.counties[shape.id] ?? 0) : '—'}</text>)}
                {!state && <g className="map-inset-labels" pointerEvents="none"><text x="150" y="635">ALASKA</text><text x="365" y="635">HAWAII</text><text x="875" y="645">PUERTO RICO</text></g>}
              </svg>}
              <div className="map-zoom-controls"><button aria-label="Zoom in on county map" onClick={() => zoom(.7)} disabled={view.width <= 180}><Plus size={18} /></button><button aria-label="Zoom out on county map" onClick={() => zoom(1 / .7)} disabled={view.width === 1000}><Minus size={18} /></button><button onClick={() => setView(fullView)} className="map-reset">Reset</button></div>
            </div>
            <div className="county-map-selection" aria-live="polite"><MapPin size={17} /><div>{active ? <><strong>{active.name}, {active.state}</strong><span>{activeCount === null ? 'Total unavailable' : `${format(activeCount)} ${activeCount === 1 ? 'pledge' : 'pledges'}`}</span></> : <><strong>Find your county</strong><span>Tap the map or use the searchable list.</span></>}</div></div>
          </div>
          <div className="map-legend"><span><i className="legend-zero" />No pledges</span><span><i className="legend-pledged" />Pledges recorded</span><span>Zoom in for smaller counties</span></div>
        </div>
        <aside className="county-search-panel" aria-label="Search county pledge totals">
          <label htmlFor="county-map-search" className="font-semibold text-patriot-navy">Find a county</label>
          <div className="relative mt-3"><Search className="absolute left-3 top-3.5 text-patriot-muted" size={18} /><input id="county-map-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(50) }} placeholder="Search counties or states" className="h-12 w-full rounded-sm border border-patriot-border bg-white pl-10 pr-3 text-base" /></div>
          <p className="mt-3 text-xs leading-relaxed text-patriot-muted">{format(matching.length)} {matching.length === 1 ? 'county' : 'counties'}{stateName ? ` in ${stateName}` : ' nationwide'}. Search by county or state name. County equivalents are included.</p>
          {state && query && <button className="mt-2 text-sm font-semibold text-patriot-red underline" onClick={() => changeState('')}>Search all states</button>}
          <div className="county-search-results" aria-label="County results">
            {matching.length === 0 && <p className="py-8 text-sm text-patriot-muted">No counties match. Try a different name or select all states.</p>}
            {matching.slice(0, limit).map((county) => <button key={county.id} className={`county-result${selected === county.id ? ' is-selected' : ''}`} aria-pressed={selected === county.id} onClick={() => chooseCounty(county.id)}><span><strong>{county.name}</strong><small>{stateByCode.get(county.state)?.name}</small></span><span className="county-result-count">{data ? format(data.counties[county.id] ?? 0) : '—'}</span></button>)}
            {matching.length > limit && <button className="my-3 w-full border border-patriot-border py-3 text-sm font-semibold text-patriot-navy" onClick={() => setLimit((value) => value + 50)}>Show more counties</button>}
          </div>
          <Link to="/action#pledge" className="mt-5 flex items-center justify-between gap-2 border-t border-patriot-border pt-5 font-semibold text-patriot-red">Add your pledge <ArrowUpRight size={18} /></Link>
        </aside>
      </div>
      <div className="pledge-map-footnote"><span>{loading ? 'Updating totals…' : data ? `Checked ${new Date(data.asOf).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · Refreshes every 30 seconds` : 'Waiting for totals'}. One pledge per email address.</span><a href="https://www.census.gov/geographies/mapping-files/2025/geo/carto-boundary-file.html" target="_blank" rel="noreferrer">County boundaries: U.S. Census Bureau, 2025</a></div>
    </section>
  )
}
