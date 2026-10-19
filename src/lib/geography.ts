import countiesData from '../data/counties.json'
import statesData from '../data/states.json'

export type County = { id: string; state: string; name: string }
export type State = { id: string; code: string; name: string }
export const counties: County[] = countiesData
export const states: State[] = statesData
export const countyById = new Map(counties.map((county) => [county.id, county]))
export const stateByCode = new Map(states.map((state) => [state.code, state]))
export const countiesForState = (code: string) => counties.filter((county) => county.state === code).sort((a, b) => a.name.localeCompare(b.name))
export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export function searchCounties(query: string, state = '') {
  const words = normalizeSearch(query).split(' ').filter(Boolean)
  return counties.filter((county) => (!state || county.state === state) && words.every((word) => normalizeSearch(`${county.name} ${county.state} ${stateByCode.get(county.state)?.name} ${county.id}`).split(' ').some((part) => part.startsWith(word))))
}
