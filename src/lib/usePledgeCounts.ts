import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPledgeCounts, type PledgeCounts } from './pledges'

export function usePledgeCounts() {
  const [data, setData] = useState<PledgeCounts | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const controller = useRef<AbortController | null>(null)
  const refresh = useCallback(async () => {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setLoading(true)
    try {
      const counts = await fetchPledgeCounts(AbortSignal.any([request.signal, AbortSignal.timeout(15000)]))
      if (!request.signal.aborted) { setData(counts); setError('') }
    } catch {
      if (!request.signal.aborted) setError('We couldn’t refresh pledge totals. Please try again.')
    } finally {
      if (!request.signal.aborted) setLoading(false)
    }
  }, [])
  useEffect(() => {
    void refresh()
    const poll = () => { if (document.visibilityState === 'visible') void refresh() }
    const timer = window.setInterval(poll, 30000)
    window.addEventListener('pledge-recorded', poll)
    document.addEventListener('visibilitychange', poll)
    return () => { clearInterval(timer); controller.current?.abort(); window.removeEventListener('pledge-recorded', poll); document.removeEventListener('visibilitychange', poll) }
  }, [refresh])
  return { data, error, loading, refresh }
}
