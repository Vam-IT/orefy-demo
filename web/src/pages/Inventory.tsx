import { resourcesFor } from '../demo/data.ts'
import { useStore } from '../demo/store.tsx'
import { Button, Empty, PageHead } from '../ui.tsx'
import { ResourceTable, type Go } from './shared.tsx'

export function Inventory({ go }: { go: Go }) {
  const { t, latest, startRun } = useStore()
  return (
    <>
      <PageHead
        title={t('Inventar', 'Inventory')}
        lead={t('Alle Ressourcen aus der letzten Inspektion und wie sie im Code abgebildet werden.', 'All resources from the latest inspection and how they map to code.')}
      />
      {latest?.inspected ? (
        <ResourceTable resources={resourcesFor(latest.services)} showMapping={latest.generated} />
      ) : (
        <Empty
          icon="database" title={t('Noch nichts inspiziert', 'Nothing inspected yet')}
          text={t('Das Inventar entsteht bei der Inspektion im Lauf.', 'The inventory is created by the inspection step of a run.')}
          action={<Button variant="primary" iconRight="arrowRight" onClick={() => { startRun(); go('/run') }}>{t('Zum Lauf', 'Go to run')}</Button>}
        />
      )}
    </>
  )
}
