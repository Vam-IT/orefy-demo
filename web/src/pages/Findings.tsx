import { findingsFor, stats } from '../demo/data.ts'
import { useStore } from '../demo/store.tsx'
import { Button, Empty, PageHead } from '../ui.tsx'
import { FindingCard, PlannedNote, type Go } from './shared.tsx'

export function Findings({ go }: { go: Go }) {
  const { t, latest, startRun } = useStore()
  const ready = latest?.verified
  return (
    <>
      <PageHead
        title={t('Befunde', 'Findings')}
        lead={t('Abgleich des Codes mit CIS, ISO 27001, BSI C5, NIS2 und eigenen Richtlinien.', 'The code checked against CIS, ISO 27001, BSI C5, NIS2 and your own policies.')}
      />
      <PlannedNote>
        {t(
          'Der Compliance-Abgleich ist geplant. Die Demo zeigt, wie Befunde und ihre Fixes aussehen werden.',
          'The compliance check is planned. The demo shows what findings and their fixes will look like.',
        )}
      </PlannedNote>
      {ready ? (
        <div className="panel findings">
          {findingsFor(latest.services).map((f) => (
            <FindingCard key={f.id} finding={f} count={stats(latest.services).clickops} />
          ))}
        </div>
      ) : (
        <Empty
          icon="shield" title={t('Noch keine Befunde', 'No findings yet')}
          text={t('Befunde entstehen, sobald der Code geprüft ist.', 'Findings appear once the code is verified.')}
          action={<Button variant="primary" iconRight="arrowRight" onClick={() => { startRun(); go('/run') }}>{t('Zum Lauf', 'Go to run')}</Button>}
        />
      )}
    </>
  )
}
