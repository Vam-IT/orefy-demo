import { useStore } from '../demo/store.tsx'
import { Button, PageHead, Planned, Status } from '../ui.tsx'
import type { Go } from './shared.tsx'

export function Features({ go }: { go: Go }) {
  const { t, active, startRun } = useStore()
  const building: [string, string][] = [
    [t('Inspektion mit reinem Lesezugriff', 'Inspection with read-only access'), t('Orefy liest den Bestand eines AWS-Accounts, ohne etwas zu verändern.', 'Orefy reads the inventory of an AWS account without changing anything.')],
    [t('Modularer Terraform-Code', 'Modular Terraform code'), t('Bewährte Community-Module mit festen Versionen, wo es sie gibt.', 'Proven community modules with pinned versions wherever they exist.')],
    [t('Import-Blöcke', 'Import blocks'), t('Bestehende Ressourcen werden übernommen statt neu angelegt.', 'Existing resources are adopted instead of recreated.')],
    [t('Prüfung bis Zero-diff', 'Verification down to Zero-diff'), t('Der Code gilt erst als fertig, wenn ein Plan keine Änderung zeigt.', 'The code only counts as done when a plan shows no change.')],
    [t('Schutz von Geheimnissen', 'Protection of secrets'), t('Secrets werden geschwärzt, bevor Daten ein Modell, eine Datei oder ein Protokoll erreichen.', 'Secrets are redacted before data reaches a model, a file or a log.')],
    [t('Diese Konsole', 'This console'), t('Geführter Ablauf vom Verbinden bis zur Übergabe.', 'Guided workflow from connecting to handover.')],
  ]
  const planned: [string, string][] = [
    [t('Übergabe an GitHub und GitLab', 'Handover to GitHub and GitLab'), t('Der Code landet als Pull bzw. Merge Request direkt in Ihrem Repository. Bitbucket und Azure DevOps folgen.', 'The code arrives in your repository as a pull or merge request. Bitbucket and Azure DevOps follow.')],
    [t('CI/CD-Pipeline mit Deployment', 'CI/CD pipeline with deployment'), t('Fertige Pipeline für GitHub Actions oder GitLab CI/CD: prüft jede Änderung und wendet sie nach Freigabe mit kurzlebigen Zugangsdaten (OIDC) in AWS an.', 'Ready-made pipeline for GitHub Actions or GitLab CI/CD: checks every change and applies it to AWS after approval, using short-lived credentials (OIDC).')],
    [t('Sicherheit und Compliance', 'Security and compliance'), t('Abgleich mit CIS, ISO 27001, BSI C5, NIS2 und eigenen Richtlinien, jeder Befund mit Fix als Code.', 'Checks against CIS, ISO 27001, BSI C5, NIS2 and your own policies, every finding with a fix as code.')],
    [t('Mehrere Accounts und Regionen', 'Multiple accounts and regions'), t('Ein Lauf über die ganze Organisation.', 'One run across the whole organisation.')],
    [t('Netzwerk und Rechenzentrum', 'Network and data centre'), t('Geräte und Dienste im eigenen Netz als Ziel.', 'Devices and services in your own network as a target.')],
  ]
  const list = (rows: [string, string][], badge: 'building' | 'planned') => (
    <ul className="feature-list">
      {rows.map(([title, text]) => (
        <li key={title}>
          <div><b>{title}</b><span>{text}</span></div>
          {badge === 'planned' ? <Planned /> : <Status tone="info" icon="play">{t('In Entwicklung', 'In development')}</Status>}
        </li>
      ))}
    </ul>
  )
  return (
    <>
      <PageHead
        title={t('Funktionsumfang', 'Feature scope')}
        lead={t('Was Orefy leisten wird und was davon diese Demo zeigt. Verfügbar ab Q1 2027.', 'What Orefy will do and which parts this demo shows. Available from Q1 2027.')}
        actions={
          <Button variant="primary" iconRight="arrowRight" onClick={() => { startRun(); go('/run') }}>
            {active ? t('Demo fortsetzen', 'Continue the demo') : t('Demo starten', 'Start the demo')}
          </Button>
        }
      />
      <section className="panel">
        <div className="panel-head"><h2>{t('Kern des Produkts', 'Core of the product')}</h2></div>
        {list(building, 'building')}
      </section>
      <section className="panel">
        <div className="panel-head"><h2>{t('Danach geplant', 'Planned next')}</h2></div>
        {list(planned, 'planned')}
      </section>
      <p className="feature-cta">
        {t('Fehlt etwas, das Sie brauchen?', 'Missing something you need?')}{' '}
        <a className="link" href="#/contact">{t('Schreiben Sie uns.', 'Write to us.')}</a>
      </p>
    </>
  )
}
