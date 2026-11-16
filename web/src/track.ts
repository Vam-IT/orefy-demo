// Optional, cookieless usage statistics. Nothing loads unless VITE_ANALYTICS_SRC is set at build time.
// The script is expected to expose window.plausible(event, options), as Plausible and compatible tools do.

const SRC = import.meta.env.VITE_ANALYTICS_SRC as string | undefined
const DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void
  }
}

export function initTracking(): void {
  if (!SRC) return
  const s = document.createElement('script')
  s.defer = true
  s.src = SRC
  if (DOMAIN) s.dataset.domain = DOMAIN
  document.head.append(s)
}

export function track(event: string, props?: Record<string, string | number>): void {
  window.plausible?.(event, props ? { props } : undefined)
}
