import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SERVICES, type Service } from './data.ts'

export interface Run {
  id: number
  services: Service[]
  startedAt: number
  /** Furthest wizard step reached, 1 to 6. */
  step: number
  connected: boolean
  inspected: boolean
  generated: boolean
  verified: boolean
  /** Finding ids whose fix goes into the handover. */
  fixes: string[]
  handover: null | 'pr' | 'zip'
  finishedAt?: number
}

export type Lang = 'de' | 'en'
export type Theme = 'light' | 'dark'

interface State {
  runs: Run[]
}

interface Store {
  runs: Run[]
  /** The run still in the wizard, if any. */
  active: Run | null
  /** Most recent run, the source for inventory, code and findings pages. */
  latest: Run | null
  startRun: () => void
  updateRun: (patch: Partial<Run>) => void
  reset: () => void
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  setTheme: (t: Theme) => void
  t: (de: string, en: string) => string
}

const KEY = 'orefy.demo.v1'
const Ctx = createContext<Store | null>(null)

function load(): State {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as State | null
    if (s && Array.isArray(s.runs)) return s
  } catch {
    /* fall through to a fresh demo */
  }
  return { runs: [] }
}

const pref = <T extends string>(key: string, allowed: T[], fallback: T): T => {
  try {
    const v = localStorage.getItem(key) as T | null
    return v && allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [lang, setLangState] = useState<Lang>(() => pref('orefy.lang', ['de', 'en'], 'de'))
  const [theme, setThemeState] = useState<Theme>(() => pref('orefy.theme', ['light', 'dark'], 'light'))

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable: the demo still works for this page view */
    }
  }, [state])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dataset.theme = theme
    document.title = 'Orefy Demo'
  }, [lang, theme])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('orefy.lang', l) } catch { /* ignore */ }
  }, [])
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try { localStorage.setItem('orefy.theme', t) } catch { /* ignore */ }
  }, [])

  const startRun = useCallback(() => {
    setState((s) => {
      const last = s.runs[s.runs.length - 1]
      if (last && !last.handover) return s
      const run: Run = {
        id: s.runs.length + 1,
        services: SERVICES.map((x) => x.id),
        startedAt: Date.now(),
        // The demo starts at the inspection: target and scope are pre-set and can still be changed.
        step: 3,
        connected: true,
        inspected: false, generated: false, verified: false,
        fixes: [], handover: null,
      }
      return { runs: [...s.runs, run] }
    })
  }, [])

  const updateRun = useCallback((patch: Partial<Run>) => {
    setState((s) => {
      if (!s.runs.length) return s
      const runs = s.runs.slice()
      runs[runs.length - 1] = { ...runs[runs.length - 1], ...patch }
      return { runs }
    })
  }, [])

  const reset = useCallback(() => setState({ runs: [] }), [])

  const value = useMemo<Store>(() => {
    const latest = state.runs[state.runs.length - 1] ?? null
    return {
      runs: state.runs,
      latest,
      active: latest && !latest.handover ? latest : null,
      startRun, updateRun, reset,
      lang, setLang, theme, setTheme,
      t: (de, en) => (lang === 'de' ? de : en),
    }
  }, [state, lang, theme, startRun, updateRun, reset, setLang, setTheme])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}

/** Hash routing keeps the app a single index.html, which is all GitHub Pages serves. */
export function useRoute(): [string, (to: string) => void] {
  const read = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((to: string) => {
    window.location.hash = to
    window.scrollTo(0, 0)
  }, [])
  return [route, go]
}
