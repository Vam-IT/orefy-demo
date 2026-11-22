import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SERVICES, START_LANG, type Provider, type Service } from './data.ts'

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
  /** Set when the code was pushed to a repository. */
  delivery?: { provider: Provider; repo: string; pipeline: boolean; applied: boolean }
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

const Ctx = createContext<Store | null>(null)

// The demo keeps everything in memory: the privacy policy on orefy.cloud promises that nothing is written to or
// read from the visitor's device. Do not add local or session storage without changing that policy first.

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ runs: [] })
  const [lang, setLang] = useState<Lang>(START_LANG)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dataset.theme = theme
    document.title = 'Orefy Demo'
  }, [lang, theme])

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
