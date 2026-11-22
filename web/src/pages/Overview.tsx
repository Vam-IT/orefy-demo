import type { ReactNode } from 'react'
import { findingsFor, stats } from '../demo/data.ts'
import { useStore } from '../demo/store.tsx'
import { Button, Icon, Logo, PageHead, Status, Term, type IconName } from '../ui.tsx'
import { Outcomes, formatTime, runStatus, type Go } from './shared.tsx'

export function Overview({ go }: { go: Go }) {
  const { t, lang, runs, latest, active, startRun } = useStore()
  const begin = () => { startRun(); go('/run') }

  if (runs.length === 0) {
    const pains: [IconName, string, string][] = [
      ['alert', t('Wissen nur in Köpfen', 'Knowledge only in people\'s heads'), t('Über Jahre wurde in der Konsole geklickt. Niemand kann sicher sagen, was läuft und warum.', 'For years things were clicked together in the console. Nobody can say for sure what is running and why.')],
      ['alert', t('Kein Wiederaufbau', 'No way to rebuild'), t('Fällt etwas aus oder wird versehentlich gelöscht, muss es von Hand nachgebaut werden.', 'If something fails or is deleted by accident, it has to be rebuilt by hand.')],
      ['alert', t('Kein Nachweis', 'No evidence'), t('Audits und NIS2 verlangen Belege für Konfiguration und Änderungen. Die Konsole liefert sie nicht.', 'Audits and NIS2 demand evidence of configuration and changes. The console does not provide it.')],
    ]
    return (
      <>
        <section className="panel start">
          <p className="over">{t('Interaktive Demo · etwa 3 Minuten · ohne Anmeldung', 'Interactive demo · about 3 minutes · no sign-up')}</p>
          <h1 className="start-title">{t('Ihre AWS-Umgebung, vollständig als geprüfter Code', 'Your AWS environment, completely in verified code')}</h1>
          <p className="lead">
            {t(
              'Orefy liest aus, was in Ihrem Account tatsächlich läuft, schreibt daraus sauberen Terraform-Code und weist nach, dass er exakt Ihrer Umgebung entspricht. Ohne etwas zu verändern.',
              'Orefy reads what is actually running in your account, turns it into clean Terraform code and proves that it matches your environment exactly. Without changing anything.',
            )}
          </p>
          <div className="start-cta">
            <Button variant="primary" iconRight="arrowRight" onClick={begin}>{t('Demo starten', 'Start the demo')}</Button>
            <span className="muted">{t('Mit Beispieldaten. Es wird nichts installiert und kein Account verbunden.', 'With example data. Nothing is installed and no account is connected.')}</span>
          </div>
          <div className="works-with">
            <span><Logo name="aws" size={22} /><span>{t('Liest', 'Reads')} <b>Amazon Web Services</b></span></span>
            <span><Logo name="terraform" size={20} /><span>{t('Schreibt', 'Writes')} <b>Terraform</b></span></span>
            <span><Logo name="github" size={20} /><Logo name="gitlab" size={20} /><span>{t('Übergabe an', 'Hands over to')} <b>GitHub</b> {t('und', 'and')} <b>GitLab</b> ({t('geplant', 'planned')})</span></span>
          </div>
        </section>

        <div className="compare">
          <section className="panel pad">
            <p className="over">{t('Heute', 'Today')}</p>
            <h2>{t('Gewachsene Umgebung ohne Code', 'A grown environment without code')}</h2>
            <ul className="pains">
              {pains.map(([icon, title, text]) => (
                <li key={title}><Icon name={icon} size={20} /><div><b>{title}</b><span>{text}</span></div></li>
              ))}
            </ul>
          </section>
          <section className="panel pad compare-after">
            <p className="over">{t('Mit Orefy', 'With Orefy')}</p>
            <h2>{t('Dieselbe Umgebung, als Code', 'The same environment, in code')}</h2>
            <Outcomes />
          </section>
        </div>

        <section className="panel pad">
          <h2>{t('So läuft es ab', 'How it works')}</h2>
          <ol className="how">
            {([
              ['database', t('1. Bestand erfassen', '1. Capture the inventory'), t('Orefy liest mit reinem Lesezugriff, was in Ihrem Account läuft.', 'With read-only access Orefy reads what runs in your account.')],
              ['code', t('2. Code erzeugen', '2. Generate code'), t('Daraus entsteht lesbarer, modularer Terraform-Code.', 'It becomes readable, modular Terraform code.')],
              ['checkCircle', t('3. Beweisen', '3. Prove it'), t('Ein Abgleich zeigt: Code und Umgebung stimmen überein.', 'A comparison shows: code and environment match.')],
              ['pullRequest', t('4. Übernehmen', '4. Take over'), t('Ihr Team prüft den Code und gibt ihn frei.', 'Your team reviews the code and approves it.')],
            ] as [IconName, string, string][]).map(([icon, title, text]) => (
              <li key={title}>
                <span className="how-icon"><Icon name={icon} size={20} /></span>
                <b>{title}</b>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <div className="start-cta">
            <Button variant="primary" iconRight="arrowRight" onClick={begin}>{t('Demo starten', 'Start the demo')}</Button>
            <a className="link" href="#/security">{t('Wie sicher ist das?', 'How safe is this?')}</a>
          </div>
        </section>
      </>
    )
  }

  const s = latest?.inspected ? stats(latest.services) : null
  const findings = latest?.verified ? findingsFor(latest.services).length : null
  const kpis: { label: ReactNode; value: string; hint: string }[] = [
    { label: t('Ressourcen', 'Resources'), value: s ? String(s.total) : '–', hint: t('im Account gefunden', 'found in the account') },
    { label: <>{t('Anteil', 'Share of')} <Term k="clickops">ClickOps</Term></>, value: s ? `${s.clickopsShare} %` : '–', hint: t('von Hand angelegt, ohne Code', 'created by hand, without code') },
    {
      label: t('Unterschiede Code zu Umgebung', 'Differences code vs. environment'),
      value: latest?.verified ? '0' : '–',
      hint: latest?.verified ? t('Code entspricht der Live-Umgebung', 'code matches the live environment') : t('nach der Prüfung', 'after verification'),
    },
    { label: t('Befunde', 'Findings'), value: findings === null ? '–' : String(findings), hint: t('Sicherheit und Compliance', 'security and compliance') },
  ]

  return (
    <>
      <PageHead
        title={t('Übersicht', 'Overview')}
        lead={t('Stand der Überführung Ihres AWS-Accounts in Code.', 'Status of turning your AWS account into code.')}
        actions={
          active
            ? <Button variant="primary" iconRight="arrowRight" onClick={() => go('/run')}>{t('Demo fortsetzen', 'Continue the demo')}</Button>
            : <Button icon="plus" onClick={begin}>{t('Neuen Lauf starten', 'Start new run')}</Button>
        }
      />
      <section className="kpis" aria-label={t('Kennzahlen', 'Key figures')}>
        {kpis.map((k, n) => (
          <div className="kpi" key={n}>
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value">{k.value}</span>
            <span className="kpi-hint">{k.hint}</span>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>{t('Letzte Läufe', 'Recent runs')}</h2>
          <a className="link" href="#/runs">{t('Alle anzeigen', 'Show all')}</a>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr><th>{t('Lauf', 'Run')}</th><th>{t('Gestartet', 'Started')}</th><th>{t('Umfang', 'Scope')}</th><th>{t('Status', 'Status')}</th></tr>
            </thead>
            <tbody>
              {runs.slice().reverse().slice(0, 5).map((r) => {
                const st = runStatus(r, t)
                return (
                  <tr key={r.id}>
                    <td className="mono">#{r.id}</td>
                    <td>{formatTime(r.startedAt, lang)}</td>
                    <td>{r.services.length} {t('Dienste', 'services')}</td>
                    <td><Status tone={st.tone}>{st.label}</Status></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {!active && (
        <section className="panel pad cta-panel">
          <div>
            <h2>{t('Das möchten Sie für Ihre eigene Umgebung?', 'Want this for your own environment?')}</h2>
            <p className="muted">{t('Orefy ist ab Q1 2027 verfügbar. Frühe Teams gestalten mit.', 'Orefy is available from Q1 2027. Early teams help shape it.')}</p>
          </div>
          <Button variant="primary" iconRight="arrowRight" onClick={() => go('/contact')}>{t('Early Access anfragen', 'Request early access')}</Button>
        </section>
      )}
    </>
  )
}
