import { useMemo, useState, type ReactNode } from 'react'
import { generateFiles } from '../demo/codegen.ts'
import { MODULES, CALLS, SERVICE_LABEL, type Finding, type Resource, type Service } from '../demo/data.ts'
import { useStore, type Run } from '../demo/store.tsx'
import { Hcl, Icon, Planned, Segmented, ServiceLogo, SeverityBadge, Status, type Tone } from '../ui.tsx'

export type Go = (to: string) => void

export function runStatus(run: Run, t: (de: string, en: string) => string): { tone: Tone; label: string } {
  if (run.handover === 'pr') {
    return run.delivery?.provider === 'gitlab'
      ? { tone: 'ok', label: t('Übergeben als Merge Request', 'Handed over as merge request') }
      : { tone: 'ok', label: t('Übergeben als Pull Request', 'Handed over as pull request') }
  }
  if (run.handover === 'zip') return { tone: 'ok', label: t('Übergeben als ZIP', 'Handed over as ZIP') }
  if (run.verified) return { tone: 'ok', label: 'Zero-diff' }
  if (run.generated) return { tone: 'info', label: t('Code erzeugt, Prüfung offen', 'Code generated, verification pending') }
  if (run.inspected) return { tone: 'info', label: t('Inspiziert', 'Inspected') }
  return { tone: 'neutral', label: t('Entwurf', 'Draft') }
}

export function formatTime(ts: number, lang: string): string {
  return new Date(ts).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function mapping(r: Resource): string {
  if (r.managed === 'iac') return ''
  if (r.raw) return r.raw.type
  const call = CALLS.find((c) => c.name === r.call)
  return call ? MODULES[call.module].source.replace('terraform-aws-modules/', '') : ''
}

export function ResourceTable({ resources, showMapping, toolbar }: { resources: Resource[]; showMapping?: boolean; toolbar?: ReactNode }) {
  const { t } = useStore()
  const [filter, setFilter] = useState<'all' | 'clickops' | 'iac'>('all')
  const [service, setService] = useState<Service | 'all'>('all')
  const [query, setQuery] = useState('')
  const services = useMemo(() => [...new Set(resources.map((r) => r.service))], [resources])
  const rows = resources.filter(
    (r) =>
      (filter === 'all' || r.managed === filter) &&
      (service === 'all' || r.service === service) &&
      (!query || `${r.name} ${r.id} ${r.kind}`.toLowerCase().includes(query.toLowerCase())),
  )
  return (
    <div className="panel">
      <div className="toolbar">
        <Segmented
          label={t('Verwaltung', 'Management')} value={filter} onChange={setFilter}
          options={[
            { value: 'all', label: t('Alle', 'All') },
            { value: 'clickops', label: 'ClickOps' },
            { value: 'iac', label: t('Bereits IaC', 'Already IaC') },
          ]}
        />
        <label className="field-inline">
          <span className="sr-only">{t('Dienst', 'Service')}</span>
          <select value={service} onChange={(e) => setService(e.target.value as Service | 'all')}>
            <option value="all">{t('Alle Dienste', 'All services')}</option>
            {services.map((s) => <option key={s} value={s}>{SERVICE_LABEL[s]}</option>)}
          </select>
        </label>
        <label className="field-inline grow">
          <span className="sr-only">{t('Suchen', 'Search')}</span>
          <input type="search" placeholder={t('Name oder ID suchen', 'Search name or ID')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <span className="count">{rows.length} / {resources.length}</span>
        {toolbar}
      </div>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>{t('Ressource', 'Resource')}</th>
              <th>{t('Typ', 'Type')}</th>
              <th>{t('Dienst', 'Service')}</th>
              <th>{t('Verwaltet durch', 'Managed by')}</th>
              {showMapping && <th>{t('Abbildung im Code', 'Mapping in code')}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="cell-main">{r.name}</div>
                  {r.id !== r.name && <div className="cell-sub mono">{r.id}</div>}
                </td>
                <td>{r.kind}</td>
                <td>{SERVICE_LABEL[r.service]}</td>
                <td>
                  {r.managed === 'clickops'
                    ? <Status tone="warn">ClickOps</Status>
                    : <Status tone="ok">{t('Terraform (übersprungen)', 'Terraform (skipped)')}</Status>}
                </td>
                {showMapping && (
                  <td>
                    {r.managed === 'iac' ? <span className="muted">–</span> : r.raw ? (
                      <Status tone="info" icon="info">{t('Raw-Fallback', 'Raw fallback')} · <span className="mono">{mapping(r)}</span></Status>
                    ) : (
                      <Status tone="ok" icon="check">{t('Modul', 'Module')} · <span className="mono">{mapping(r)}</span></Status>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={showMapping ? 5 : 4} className="table-empty">{t('Keine Ressource passt zum Filter.', 'No resource matches the filter.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CodeBrowser({ services, verified }: { services: Service[]; verified: boolean }) {
  const { t } = useStore()
  const files = useMemo(() => generateFiles(services, verified), [services, verified])
  const [name, setName] = useState('')
  // Open on a file that shows real infrastructure, not on boilerplate or the import list.
  const file = files.find((f) => f.name === name)
    ?? files.find((f) => !['versions.tf', 'providers.tf', 'variables.tf', 'imports.tf'].includes(f.name))
    ?? files[0]
  return (
    <div className="panel code-browser">
      <ul className="file-list" aria-label={t('Erzeugte Dateien', 'Generated files')}>
        {files.map((f) => (
          <li key={f.name}>
            <button type="button" aria-pressed={f.name === file.name} onClick={() => setName(f.name)}>
              <Icon name="file" size={14} />
              <span className="mono">{f.name}</span>
              <span className="file-lines">{f.content.trimEnd().split('\n').length}</span>
            </button>
          </li>
        ))}
      </ul>
      <Hcl code={file.content.trimEnd()} />
    </div>
  )
}

export function FindingCard({ finding, count, checked, onToggle }: {
  finding: Finding
  /** Number of affected resources, for findings that are not tied to one resource. */
  count?: number
  checked?: boolean
  onToggle?: (on: boolean) => void
}) {
  const { t, lang } = useStore()
  const [open, setOpen] = useState(false)
  const resource = finding.resource || `${count ?? 0} ${t('Ressourcen', 'resources')}`
  const control = finding.control === 'Interne Richtlinie' ? t('Interne Richtlinie', 'Internal policy') : finding.control
  return (
    <div className="finding">
      <div className="finding-row">
        {onToggle && (
          <input
            type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)}
            aria-label={t('Fix in die Übergabe aufnehmen', 'Include fix in handover')}
          />
        )}
        <SeverityBadge severity={finding.severity} />
        <div className="finding-text">
          <b>{finding.title[lang]}</b>
          <span className="mono">{resource}</span>
        </div>
        <span className="control">{control}</span>
        <button type="button" className="link" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t('Fix ausblenden', 'Hide fix') : t('Fix ansehen', 'View fix')}
        </button>
      </div>
      {open && (
        <div className="diff" role="group" aria-label={`${t('Änderung in', 'Change in')} ${finding.file}`}>
          <div className="diff-head mono">{finding.file}</div>
          <pre>
            {finding.diff.map((l, n) => (
              <span key={n} className={l.sign === '+' ? 'add' : l.sign === '-' ? 'del' : undefined}>{l.sign} {l.text}{'\n'}</span>
            ))}
          </pre>
        </div>
      )}
    </div>
  )
}

export function PlannedNote({ children }: { children: ReactNode }) {
  return (
    <p className="note">
      <Planned />
      <span>{children}</span>
    </p>
  )
}

/** What Orefy may and may not do. Shown when connecting and on the security page. */
export function Rights() {
  const { t } = useStore()
  return (
    <div className="rights">
      <div>
        <h3><Icon name="check" /> {t('Orefy darf', 'Orefy may')}</h3>
        <ul>
          <li>{t('Die Konfiguration Ihrer Ressourcen lesen', 'Read the configuration of your resources')}</li>
          <li>{t('Code mit Ihrer Umgebung abgleichen (', 'Compare code with your environment (')}<span className="mono">terraform plan</span>)</li>
          <li className="muted"><span className="mono">describe_* · list_* · get_*</span></li>
        </ul>
      </div>
      <div>
        <h3><Icon name="x" /> {t('Orefy darf nicht', 'Orefy may not')}</h3>
        <ul>
          <li>{t('Ressourcen anlegen, ändern oder löschen', 'Create, change or delete resources')}</li>
          <li>{t('Inhalte von Passwörtern und Schlüsseln lesen', 'Read the contents of passwords and keys')}</li>
          <li>{t('Code anwenden (', 'Apply code (')}<span className="mono">terraform apply</span>)</li>
        </ul>
      </div>
    </div>
  )
}

/** The three results a customer gets, in the customer's words. */
export function Outcomes() {
  const { t } = useStore()
  const rows: [string, string][] = [
    [t('Dokumentiert', 'Documented'), t('Jede Ressource steht im Code. Niemand muss mehr wissen, was wo von Hand angelegt wurde.', 'Every resource is in code. Nobody has to remember what was set up by hand, and where.')],
    [t('Wiederherstellbar', 'Recoverable'), t('Fällt etwas aus, bauen Sie es aus dem Code wieder auf statt aus der Erinnerung.', 'If something fails, you rebuild it from code instead of from memory.')],
    [t('Prüfbar', 'Auditable'), t('Änderungen laufen über Freigaben. Für Audits und NIS2 liegt der Nachweis im Repository.', 'Changes go through approvals. For audits and NIS2 the evidence is in the repository.')],
  ]
  return (
    <ul className="outcomes">
      {rows.map(([title, text]) => (
        <li key={title}>
          <Icon name="checkCircle" size={20} />
          <div><b>{title}</b><span>{text}</span></div>
        </li>
      ))}
    </ul>
  )
}

/**
 * The account as a picture: one tile per resource, grouped by service.
 * `coded` shows the state after the run, when everything unmanaged is in code.
 */
/** Tiles shown per service on a phone before the rest is folded away. */
const MAP_PREVIEW = 6

export function ResourceMap({ resources, coded }: { resources: Resource[]; coded?: boolean }) {
  const { t } = useStore()
  const [open, setOpen] = useState<Service[]>([])
  const services = [...new Set(resources.map((r) => r.service))]
  return (
    <div className="map">
      <div className="map-groups">
        {services.map((s) => {
          const rows = resources.filter((r) => r.service === s)
          return (
            <section key={s} className="map-group">
              <h3><span className="with-logo"><ServiceLogo service={s} size={18} />{SERVICE_LABEL[s]}</span> <span>{rows.length}</span></h3>
              <ul>
                {rows.map((r, n) => {
                  const state = r.managed === 'iac' ? 'iac' : coded ? 'coded' : 'clickops'
                  const folded = n >= MAP_PREVIEW && !open.includes(s)
                  return (
                    <li key={r.id} className={`tile tile-${state}${folded ? ' tile-more' : ''}`} title={`${r.kind} · ${r.id}`}>
                      <Icon name={state === 'clickops' ? 'alert' : 'check'} size={13} />
                      <span>{r.name}</span>
                      <small>{r.kind}</small>
                    </li>
                  )
                })}
                {rows.length > MAP_PREVIEW && !open.includes(s) && (
                  <li className="map-more">
                    <button type="button" className="link" onClick={() => setOpen([...open, s])}>
                      {t(`+ ${rows.length - MAP_PREVIEW} weitere`, `+ ${rows.length - MAP_PREVIEW} more`)}
                    </button>
                  </li>
                )}
              </ul>
            </section>
          )
        })}
      </div>
      <ul className="map-legend">
        {!coded && <li className="tile-clickops"><Icon name="alert" size={13} /> {t('Von Hand angelegt, ohne Code', 'Created by hand, without code')}</li>}
        {coded && <li className="tile-coded"><Icon name="check" size={13} /> {t('Jetzt als Code', 'Now in code')}</li>}
        <li className="tile-iac"><Icon name="check" size={13} /> {t('War bereits als Code verwaltet', 'Was already managed as code')}</li>
      </ul>
    </div>
  )
}
