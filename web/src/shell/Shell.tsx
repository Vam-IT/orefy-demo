import { useEffect } from 'react'
import { TARGET, WEBSITE_URL } from '../demo/data.ts'
import { useRoute, useStore } from '../demo/store.tsx'
import { CodePage } from '../pages/Code.tsx'
import { Contact } from '../pages/Contact.tsx'
import { Features } from '../pages/Features.tsx'
import { Findings } from '../pages/Findings.tsx'
import { Inventory } from '../pages/Inventory.tsx'
import { Overview } from '../pages/Overview.tsx'
import { Runs } from '../pages/Runs.tsx'
import { Security } from '../pages/Security.tsx'
import { track } from '../track.ts'
import { Icon, Logo, type IconName } from '../ui.tsx'
import { Wizard } from '../wizard/Wizard.tsx'

interface NavItem { to: string; icon: IconName; label: string }

export function Shell() {
  const { t, lang, setLang, theme, setTheme, reset, active, latest, runs } = useStore()
  const [route, go] = useRoute()

  useEffect(() => {
    track('pageview', { page: route })
  }, [route])

  // Result pages only appear once the demo has produced something to show there.
  const results: NavItem[] = [
    ...(runs.length ? [{ to: '/runs', icon: 'list' as const, label: active ? t('Demo-Lauf', 'Demo run') : t('Läufe', 'Runs') }] : []),
    ...(latest?.inspected ? [{ to: '/inventory', icon: 'database' as const, label: t('Inventar', 'Inventory') }] : []),
    ...(latest?.generated ? [{ to: '/code', icon: 'code' as const, label: t('Code', 'Code') }] : []),
    ...(latest?.verified ? [{ to: '/findings', icon: 'shield' as const, label: t('Befunde', 'Findings') }] : []),
  ]
  const about: NavItem[] = [
    { to: '/security', icon: 'lock', label: t('Sicherheit', 'Security') },
    { to: '/features', icon: 'layers', label: t('Funktionsumfang', 'Feature scope') },
    { to: '/contact', icon: 'mail', label: t('Kontakt', 'Contact') },
  ]
  // The wizard belongs to "Runs" in the navigation.
  const current = route === '/run' ? '/runs' : route
  const link = (n: NavItem) => (
    <a key={n.to} href={`#${n.to === '/runs' && active ? '/run' : n.to}`} aria-current={current === n.to ? 'page' : undefined}>
      <Icon name={n.icon} size={18} />
      <span>{n.label}</span>
      {n.to === '/runs' && active && <i className="dot" title={t('Lauf in Arbeit', 'Run in progress')} />}
    </a>
  )

  const page = (() => {
    switch (route) {
      case '/run': return <Wizard go={go} />
      case '/runs': return <Runs go={go} />
      case '/inventory': return <Inventory go={go} />
      case '/code': return <CodePage go={go} />
      case '/findings': return <Findings go={go} />
      case '/features': return <Features go={go} />
      case '/security': return <Security go={go} />
      case '/contact': return <Contact />
      default: return <Overview go={go} />
    }
  })()

  return (
    <div className="shell">
      <header className="topbar" data-theme="dark">
        <a className="brand" href="#/" aria-label={t('Orefy Start', 'Orefy home')}>
          <img src="/static/brand/orefy-logo-dark.svg" alt="Orefy" width="81" height="24" />
        </a>
        <div className="target" title={t('Beispiel-Account dieser Demo', 'Example account of this demo')}>
          <Logo name="aws" size={18} label="AWS" />
          <span>{TARGET.name}</span>
        </div>
        <span className="demo-flag" title={t('Alle Daten sind erfunden. Es wird kein Account verbunden.', 'All data is invented. No account is connected.')}>
          {t('Demo mit Beispieldaten', 'Demo with example data')}
        </span>
        <div className="topbar-right">
          {runs.length > 0 && (
            <button type="button" className="top-btn" aria-label={t('Neu beginnen', 'Start over')} onClick={() => { reset(); go('/') }}>
              <Icon name="reset" />
              <span>{t('Neu beginnen', 'Start over')}</span>
            </button>
          )}
          <div className="lang" role="group" aria-label={t('Sprache', 'Language')}>
            {(['de', 'en'] as const).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button
            type="button" className="top-btn icon-only theme-btn"
            aria-label={theme === 'light' ? t('Dunkle Ansicht', 'Dark theme') : t('Helle Ansicht', 'Light theme')}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} />
          </button>
          <a className="top-cta" href="#/contact" aria-label={t('Early Access anfragen', 'Request early access')}>
            <span className="cta-long">{t('Early Access anfragen', 'Request early access')}</span>
            <span className="cta-short">{t('Kontakt', 'Contact')}</span>
          </a>
        </div>
      </header>

      <nav className="sidebar" aria-label={t('Hauptnavigation', 'Main navigation')}>
        {link({ to: '/', icon: 'dashboard', label: runs.length ? t('Übersicht', 'Overview') : t('Start', 'Start') })}
        {results.map(link)}
        <span className="nav-sep" role="presentation">{t('Über Orefy', 'About Orefy')}</span>
        {about.map(link)}
      </nav>

      <main className="content">
        {page}
        <footer className="legal">
          <span>© 2026 Orefy · VAMIT UG (haftungsbeschränkt)</span>
          <a href={WEBSITE_URL} target="_blank" rel="noopener">orefy.cloud</a>
          <a href={`${WEBSITE_URL}imprint.html`} target="_blank" rel="noopener">{t('Impressum', 'Imprint')}</a>
          <a href={`${WEBSITE_URL}privacy.html`} target="_blank" rel="noopener">{t('Datenschutz', 'Privacy')}</a>
        </footer>
      </main>
    </div>
  )
}
