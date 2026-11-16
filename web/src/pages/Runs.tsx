import { SERVICE_LABEL, stats } from '../demo/data.ts'
import { useStore } from '../demo/store.tsx'
import { Button, Empty, PageHead, Status } from '../ui.tsx'
import { formatTime, runStatus, type Go } from './shared.tsx'

export function Runs({ go }: { go: Go }) {
  const { t, lang, runs, active, startRun } = useStore()
  const begin = () => { startRun(); go('/run') }
  const action = active
    ? <Button variant="primary" iconRight="arrowRight" onClick={() => go('/run')}>{t('Lauf fortsetzen', 'Continue run')}</Button>
    : <Button variant="primary" icon="plus" onClick={begin}>{t('Neuen Lauf starten', 'Start new run')}</Button>

  return (
    <>
      <PageHead
        title={t('Läufe', 'Runs')}
        lead={t('Jeder Lauf inspiziert das Ziel, erzeugt Code und prüft ihn bis Zero-diff.', 'Each run inspects the target, generates code and verifies it down to Zero-diff.')}
        actions={runs.length > 0 && action}
      />
      {runs.length === 0 ? (
        <Empty
          icon="list" title={t('Noch kein Lauf', 'No run yet')}
          text={t('Starten Sie den ersten Lauf. Der Assistent führt Sie durch alle Schritte.', 'Start the first run. The assistant guides you through every step.')}
          action={action}
        />
      ) : (
        <div className="panel">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('Lauf', 'Run')}</th><th>{t('Gestartet', 'Started')}</th><th>{t('Dienste', 'Services')}</th>
                  <th className="num">{t('Importe', 'Imports')}</th><th>{t('Status', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice().reverse().map((r) => {
                  const st = runStatus(r, t)
                  return (
                    <tr key={r.id}>
                      <td className="mono">#{r.id}</td>
                      <td>{formatTime(r.startedAt, lang)}</td>
                      <td>{r.services.map((s) => SERVICE_LABEL[s]).join(', ')}</td>
                      <td className="num mono">{r.generated ? stats(r.services).imports : '–'}</td>
                      <td><Status tone={st.tone}>{st.label}</Status></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
