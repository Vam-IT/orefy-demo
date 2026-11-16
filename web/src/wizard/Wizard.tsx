import { useEffect, useRef, useState, type ReactNode } from 'react'
import { downloadZip, generateFiles } from '../demo/codegen.ts'
import { CALLS, CONTACT_EMAIL, MODULES, SERVICES, SPEED, TARGET, deviationFor, findingsFor, resourcesFor, stats, type Service } from '../demo/data.ts'
import { useStore, type Run } from '../demo/store.tsx'
import { CodeBrowser, FindingCard, Outcomes, PlannedNote, ResourceMap, ResourceTable, Rights, type Go } from '../pages/shared.tsx'
import { track } from '../track.ts'
import { Button, Icon, Planned, Segmented, Status, Term } from '../ui.tsx'

type T = (de: string, en: string) => string

// Simulated durations per phase in milliseconds. Module constants keep effect dependencies stable.
const INSPECT_MS = [650]
const GENERATE_MS = [700]
const VERIFY_MS = [600, 1300, 700, 1600, 1500, 1600]

/** Advances a simulated process one phase at a time. Returns how many phases are finished. */
function useProgress(total: number, delays: number[], enabled: boolean, onDone: () => void): number {
  const [n, setN] = useState(enabled ? 0 : total)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  useEffect(() => {
    if (!enabled || n >= total) return
    const id = setTimeout(() => {
      setN(n + 1)
      if (n + 1 === total) done.current()
    }, delays[n % delays.length] * SPEED)
    return () => clearTimeout(id)
  }, [n, enabled, total, delays])
  return n
}

function Phase({ state, label, detail }: { state: 'todo' | 'run' | 'done' | 'warn'; label: ReactNode; detail?: ReactNode }) {
  return (
    <li className={`phase phase-${state}`}>
      <span className="phase-icon">
        {state === 'run' ? <Icon name="spinner" spin /> : state === 'done' ? <Icon name="checkCircle" /> : state === 'warn' ? <Icon name="alert" /> : <Icon name="circle" />}
      </span>
      <span className="phase-label">{label}</span>
      {detail && <span className="phase-detail">{detail}</span>}
    </li>
  )
}

const phaseState = (index: number, finished: number) => (index < finished ? 'done' : index === finished ? 'run' : 'todo')

/** Technical detail stays one click away, so the main view reads without Terraform knowledge. */
function Details({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="tech">
      <summary>{label}</summary>
      {children}
    </details>
  )
}

interface StepProps {
  run: Run
  t: T
  update: (patch: Partial<Run>) => void
}

function Connect({ t }: StepProps) {
  return (
    <>
      <fieldset className="choices">
        <legend>{t('Was möchten Sie in Code überführen?', 'What do you want to turn into code?')}</legend>
        <label className="choice" data-checked="true">
          <input type="radio" name="target" defaultChecked />
          <Icon name="cloud" size={20} />
          <span><b>{t('AWS-Account', 'AWS account')}</b><small>{t('Region Frankfurt (eu-central-1)', 'Region Frankfurt (eu-central-1)')}</small></span>
        </label>
        <label className="choice" aria-disabled="true">
          <input type="radio" name="target" disabled />
          <Icon name="network" size={20} />
          <span><b>{t('Netzwerk / Rechenzentrum', 'Network / data centre')}</b><small>{t('Geräte und Dienste im eigenen Netz', 'Devices and services in your own network')}</small></span>
          <Planned />
        </label>
      </fieldset>

      <div className="form-grid">
        <label className="field">
          <span>{t('Account-ID', 'Account ID')}</span>
          <input className="mono" readOnly value={TARGET.accountId} />
        </label>
        <label className="field">
          <span>{t('Rolle für Orefy (nur Lesen)', 'Role for Orefy (read-only)')}</span>
          <input className="mono" readOnly value={TARGET.roleArn} />
        </label>
      </div>
      <p className="hint">{t('In der Demo vorausgefüllt. Später legen Sie die Rolle mit einer bereitgestellten Vorlage in Ihrem Account an.', 'Pre-filled in the demo. Later you create the role in your account from a template we provide.')}</p>
      <Rights />
      <div className="inline-action">
        <Status tone="ok">{t('Verbunden. Nur Lesezugriff bestätigt.', 'Connected. Read-only access confirmed.')}</Status>
      </div>
    </>
  )
}

function Scope({ run, t, update }: StepProps) {
  const { lang } = useStore()
  const set = (services: Service[]) =>
    // A changed scope invalidates everything derived from the previous one.
    update({ services, inspected: false, generated: false, verified: false, fixes: [], step: 2 })
  const toggle = (id: Service, on: boolean) =>
    set(SERVICES.map((s) => s.id).filter((s) => (s === id ? on : run.services.includes(s))))
  return (
    <>
      <div className="scope-head">
        <label className="field narrow">
          <span>{t('Region', 'Region')}</span>
          <select defaultValue="eu-central-1">
            <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
            <option disabled>{t('Weitere Regionen: geplant', 'More regions: planned')}</option>
          </select>
        </label>
        <div className="scope-all">
          <button type="button" className="link" onClick={() => set(SERVICES.map((s) => s.id))}>{t('Alle auswählen', 'Select all')}</button>
          <button type="button" className="link" onClick={() => set([])}>{t('Keine', 'None')}</button>
        </div>
      </div>
      <ul className="scope-list">
        {SERVICES.map((s) => (
          <li key={s.id}>
            <label>
              <input type="checkbox" checked={run.services.includes(s.id)} onChange={(e) => toggle(s.id, e.target.checked)} />
              <span><b>{s.label}</b><small>{s.what[lang]}</small></span>
            </label>
          </li>
        ))}
      </ul>
      {run.services.length === 0 && <p className="hint warn">{t('Wählen Sie mindestens einen Dienst.', 'Select at least one service.')}</p>}
    </>
  )
}

function Inspect({ run, t, update }: StepProps) {
  const services = SERVICES.filter((s) => run.services.includes(s.id))
  const finished = useProgress(services.length, INSPECT_MS, !run.inspected, () => update({ inspected: true }))
  const [view, setView] = useState<'map' | 'table'>('map')
  const s = stats(run.services)
  const resources = resourcesFor(run.services)
  return (
    <>
      {!run.inspected && (
        <ul className="phases cols">
          {services.map((svc, n) => (
            <Phase
              key={svc.id} state={phaseState(n, finished)} label={svc.label}
              detail={n < finished ? `${resourcesFor([svc.id]).length} ${t('gefunden', 'found')}` : n === finished ? t('wird gelesen …', 'reading …') : undefined}
            />
          ))}
        </ul>
      )}
      {run.inspected && (
        <>
          <div className="headline-fact">
            <b>{s.clickops} {t('von', 'of')} {s.total}</b>
            <span>
              {t('Ressourcen wurden von Hand angelegt und stehen in keinem Code (', 'resources were created by hand and exist in no code (')}
              <Term k="clickops">ClickOps</Term>).
            </span>
          </div>
          <div className="view-switch">
            <Segmented
              label={t('Darstellung', 'View')} value={view} onChange={setView}
              options={[{ value: 'map', label: t('Karte', 'Map') }, { value: 'table', label: t('Tabelle', 'Table') }]}
            />
          </div>
          {view === 'map' ? <ResourceMap resources={resources} /> : <ResourceTable resources={resources} />}
        </>
      )}
    </>
  )
}

function Generate({ run, t, update }: StepProps) {
  const phases = [
    t('Passende Bausteine für jede Ressource suchen', 'Find a matching building block for every resource'),
    t('Code mit festen Versionen schreiben', 'Write code with pinned versions'),
    t('Bestehende Ressourcen mit dem Code verknüpfen', 'Link existing resources to the code'),
    t('Dateien nach Themen ordnen', 'Organise files by topic'),
  ]
  const finished = useProgress(phases.length, GENERATE_MS, !run.generated, () => update({ generated: true }))
  const s = stats(run.services)
  const files = generateFiles(run.services, run.verified).length
  return (
    <>
      {!run.generated && (
        <ul className="phases">
          {phases.map((p, n) => <Phase key={p} state={phaseState(n, finished)} label={p} />)}
        </ul>
      )}
      {run.generated && (
        <>
          <div className="headline-fact">
            <b>{files} {t('Dateien', 'files')}</b>
            <span>{t(`beschreiben jetzt alle ${s.imports} Ressourcen, geordnet nach Themen wie Netzwerk, Speicher und Zugriff.`, `now describe all ${s.imports} resources, organised by topics such as network, storage and access.`)}</span>
          </div>
          <ul className="fact-row">
            <li><b>{s.moduleCalls}</b> {t('aus geprüften', 'from proven')} <Term k="module">{t('Community-Bausteinen', 'community building blocks')}</Term></li>
            <li><b>{s.raw}</b> {t('direkt beschrieben', 'described directly')} (<Term k="raw">Raw-Fallback</Term>)</li>
            <li><b>{s.imports}</b> <Term k="import">{t('Verknüpfungen', 'links')}</Term> {t('zu bestehenden Ressourcen', 'to existing resources')}</li>
          </ul>
          <CodeBrowser services={run.services} verified={run.verified} />
        </>
      )}
    </>
  )
}

function Verify({ run, t, update }: StepProps) {
  const dev = deviationFor(run.services)
  const s = stats(run.services)
  const finished = useProgress(6, VERIFY_MS, !run.verified, () =>
    update({ verified: true, fixes: findingsFor(run.services).map((f) => f.id) }),
  )
  const st = (n: number) => phaseState(n, finished)
  return (
    <>
      <ul className="phases">
        <Phase state={st(0)} label={t('Code formatieren', 'Format the code')} detail={<span className="mono">terraform fmt</span>} />
        <Phase state={st(1)} label={t('Bausteine laden', 'Load building blocks')} detail={<span className="mono">terraform init</span>} />
        <Phase state={st(2)} label={t('Code auf Fehler prüfen', 'Check the code for errors')} detail={<span className="mono">terraform validate</span>} />
        <Phase
          state={finished > 3 ? 'warn' : st(3)}
          label={t('Mit Ihrer Umgebung abgleichen', 'Compare with your environment')}
          detail={finished > 3 ? t('1 Unterschied gefunden', '1 difference found') : <span className="mono">terraform plan</span>}
        />
        <Phase state={st(4)} label={t('Unterschied automatisch korrigieren', 'Correct the difference automatically')} detail={finished > 4 && t('Code angepasst', 'code adjusted')} />
        <Phase
          state={st(5)}
          label={t('Erneut abgleichen', 'Compare again')}
          detail={finished > 5 ? t('kein Unterschied', 'no difference') : <span className="mono">terraform plan</span>}
        />
      </ul>

      {run.verified && (
        <div className="banner ok" role="status">
          <Icon name="checkCircle" size={22} />
          <div>
            <b>{t('Nachgewiesen: Der Code entspricht exakt Ihrer Live-Umgebung.', 'Proven: the code matches your live environment exactly.')}</b>
            <span>
              {t(`${s.imports} Ressourcen übernommen, 0 hinzugefügt, 0 geändert, 0 gelöscht`, `${s.imports} resources adopted, 0 added, 0 changed, 0 destroyed`)}
              {' ('}<Term k="zerodiff">Zero-diff</Term>)
            </span>
          </div>
        </div>
      )}

      {finished > 3 && dev && (
        <Details label={t('Welcher Unterschied wurde gefunden?', 'Which difference was found?')}>
          <p className="hint">
            {t(
              'Im ersten Entwurf fehlte eine Einstellung. So übernommen hätte der Code Ihre Umgebung verändert. Die Prüfung hat das erkannt, der Code wurde ergänzt.',
              'The first draft lacked one setting. Adopted as it was, the code would have changed your environment. Verification caught it and the code was completed.',
            )}
          </p>
          <div className="diff">
            <pre>
              <span>{`  # ${dev.address}\n`}</span>
              <span className="del">{`~ ${dev.attr} = ${dev.live} -> ${dev.planned}\n`}</span>
              {finished > 4 && <span className="add">{`+ ${dev.input}\n`}</span>}
            </pre>
          </div>
        </Details>
      )}
    </>
  )
}

function Handover({ run, t, update }: StepProps) {
  const [busy, setBusy] = useState(false)
  const findings = findingsFor(run.services)
  const s = stats(run.services)
  useEffect(() => {
    if (!busy) return
    const id = setTimeout(() => update({ handover: 'pr', finishedAt: Date.now() }), 1000 * SPEED)
    return () => clearTimeout(id)
  }, [busy, update])
  const toggle = (id: string, on: boolean) => update({ fixes: on ? [...run.fixes, id] : run.fixes.filter((f) => f !== id) })
  return (
    <>
      <h3 className="section">{t(`${findings.length} Risiken in Ihrem Bestand`, `${findings.length} risks in your inventory`)}</h3>
      <PlannedNote>
        {t('Der Abgleich mit CIS, ISO 27001, BSI C5 und NIS2 ist geplant. So werden Befunde aussehen.', 'The check against CIS, ISO 27001, BSI C5 and NIS2 is planned. This is what findings will look like.')}
      </PlannedNote>
      <div className="panel findings">
        {findings.map((f) => (
          <FindingCard key={f.id} finding={f} count={s.clickops} checked={run.fixes.includes(f.id)} onToggle={(on) => toggle(f.id, on)} />
        ))}
      </div>

      <h3 className="section">{t('Was Sie erhalten', 'What you receive')}</h3>
      <div className="handover">
        <div className="handover-item">
          <Icon name="pullRequest" size={20} />
          <div>
            <b>{t('1. Der Code Ihrer Umgebung', '1. The code of your environment')}</b>
            <span>{t(`${s.imports} Ressourcen. Die Übernahme ändert nichts an Ihrer Umgebung.`, `${s.imports} resources. Adopting it changes nothing in your environment.`)}</span>
          </div>
        </div>
        <div className="handover-item" data-off={run.fixes.length === 0}>
          <Icon name="pullRequest" size={20} />
          <div>
            <b>{t('2. Die Korrekturen, getrennt', '2. The fixes, separately')}</b>
            <span>
              {run.fixes.length
                ? t(`${run.fixes.length} Risiken behoben. Wirkt erst, wenn Ihr Team es freigibt.`, `${run.fixes.length} risks fixed. Takes effect only when your team approves it.`)
                : t('Keine Korrektur ausgewählt.', 'No fix selected.')}
            </span>
          </div>
        </div>
      </div>
      <div className="handover-actions">
        <Button variant="primary" icon="pullRequest" busy={busy} onClick={() => setBusy(true)}>
          {t('An mein Team übergeben', 'Hand over to my team')}
        </Button>
        <Button
          icon="download" disabled={busy}
          onClick={() => { downloadZip(generateFiles(run.services, true)); update({ handover: 'zip', finishedAt: Date.now() }) }}
        >
          {t('Code als ZIP herunterladen', 'Download code as ZIP')}
        </Button>
      </div>
      <p className="hint">
        {t('Die Übergabe erfolgt als ', 'The handover arrives as a ')}<Term k="pr">Pull Request</Term>
        {t(' in Ihrem Repository. In der Demo wird nichts verschickt.', ' in your repository. Nothing is sent in the demo.')}
      </p>
    </>
  )
}

function Done({ run, t, go, onNew }: { run: Run; t: T; go: Go; onNew: () => void }) {
  const [copied, setCopied] = useState(false)
  const s = stats(run.services)
  const files = generateFiles(run.services, true).length
  const modules = new Set(CALLS.filter((c) => run.services.includes(c.service)).map((c) => MODULES[c.module].source)).size
  const findings = findingsFor(run.services).length
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + window.location.pathname + window.location.search)
      setCopied(true)
    } catch {
      /* clipboard blocked: the address bar still holds the link */
    }
  }
  return (
    <section className="panel done">
      <p className="over">{t('Demo abgeschlossen', 'Demo complete')}</p>
      <h1>{t('Aus einer gewachsenen Umgebung wurde geprüfter Code', 'A grown environment became verified code')}</h1>

      <div className="result">
        <div>
          <span className="result-label">{t('Vorher', 'Before')}</span>
          <b>{s.clickops} {t('Ressourcen ohne Code', 'resources without code')}</b>
          <span>{t('Von Hand in der Konsole angelegt, nirgends dokumentiert.', 'Created by hand in the console, documented nowhere.')}</span>
        </div>
        <Icon name="arrowRight" size={22} />
        <div>
          <span className="result-label">{t('Nachher', 'After')}</span>
          <b>{files} {t('Terraform-Dateien', 'Terraform files')}</b>
          <span>{t(`Alle ${s.imports} Ressourcen beschrieben, mit ${modules} geprüften Community-Bausteinen.`, `All ${s.imports} resources described, using ${modules} proven community building blocks.`)}</span>
        </div>
      </div>
      <ul className="result-facts">
        <li><Status tone="ok">{t('0 Änderungen an der Live-Umgebung', '0 changes to the live environment')}</Status></li>
        <li><Status tone="ok">{t('Nur Lesezugriff verwendet', 'Read-only access used')}</Status></li>
        <li><Status tone="info">{findings} {t('Risiken gefunden, jedes mit Korrektur', 'risks found, each with a fix')}</Status></li>
      </ul>

      <h2>{t('Was Sie davon haben', 'What you gain')}</h2>
      <Outcomes />

      <div className="done-cta">
        <div>
          <h2>{t('Das möchten Sie für Ihre eigene Umgebung?', 'Want this for your own environment?')}</h2>
          <p className="muted">{t('Orefy ist ab Q1 2027 verfügbar. Frühe Teams gestalten mit.', 'Orefy is available from Q1 2027. Early teams help shape it.')}</p>
          <p className="print-only">{CONTACT_EMAIL} · {window.location.host}</p>
        </div>
        <Button variant="primary" iconRight="arrowRight" onClick={() => go('/contact')}>{t('Early Access anfragen', 'Request early access')}</Button>
      </div>

      <h2>{t('Ihre Umgebung danach', 'Your environment afterwards')}</h2>
      <ResourceMap resources={resourcesFor(run.services)} coded />

      <div className="handover-actions no-print">
        <Button icon="printer" onClick={() => window.print()}>{t('Ergebnis drucken oder als PDF sichern', 'Print result or save as PDF')}</Button>
        <Button icon="link" onClick={() => void share()}>{copied ? t('Link kopiert', 'Link copied') : t('Link zur Demo kopieren', 'Copy link to demo')}</Button>
        <Button icon="code" onClick={() => go('/code')}>{t('Code ansehen', 'View code')}</Button>
        <Button icon="reset" onClick={onNew}>{t('Noch einmal durchspielen', 'Run it again')}</Button>
      </div>
    </section>
  )
}

export function Wizard({ go }: { go: Go }) {
  const { t, latest, startRun, updateRun } = useStore()
  const [view, setView] = useState(latest?.step ?? 3)
  const finished = Boolean(latest?.handover)

  // Opening the wizard without any run starts one.
  useEffect(() => {
    if (!latest) startRun()
  }, [latest, startRun])
  useEffect(() => {
    track('demo_step', { step: finished ? 7 : view })
  }, [view, finished])
  if (!latest) return null
  const run = latest

  if (run.handover) return <Done run={run} t={t} go={go} onNew={() => { startRun(); setView(3) }} />

  const steps = [
    {
      label: t('Verbinden', 'Connect'), title: t('Account verbinden', 'Connect the account'),
      lead: t('Orefy braucht nur Lesezugriff auf Ihren Account.', 'Orefy only needs read access to your account.'),
      benefit: t('Ihre Umgebung bleibt unangetastet. Orefy kann technisch nichts verändern.', 'Your environment stays untouched. Technically, Orefy cannot change anything.'),
      explain: [
        t('Sie legen in Ihrem Account eine Rolle an, die ausschließlich lesen darf.', 'You create a role in your account that can only read.'),
        t('Die Grenze ist technisch erzwungen, nicht nur eine Anweisung an die KI.', 'The limit is technically enforced, not just an instruction to the AI.'),
        t('Passwörter und Schlüssel werden geschwärzt, bevor Daten ein Modell erreichen.', 'Passwords and keys are redacted before data reaches a model.'),
      ],
      ready: run.connected, next: t('Weiter: Umfang wählen', 'Next: choose scope'),
    },
    {
      label: t('Umfang', 'Scope'), title: t('Umfang wählen', 'Choose the scope'),
      lead: t('Welche Dienste soll Orefy erfassen?', 'Which services should Orefy capture?'),
      benefit: t('Sie bestimmen das Tempo: klein anfangen, später erweitern.', 'You set the pace: start small, extend later.'),
      explain: [
        t('Sie können mit einem Dienst beginnen und weitere nachziehen.', 'You can begin with one service and add more.'),
        t('Jeder Lauf ist in sich abgeschlossen und wiederholbar.', 'Every run is self-contained and repeatable.'),
      ],
      ready: run.services.length > 0, next: t('Bestand erfassen', 'Capture the inventory'),
    },
    {
      label: t('Bestand', 'Inventory'), title: t('Was läuft in Ihrem Account?', 'What runs in your account?'),
      lead: t('Orefy liest den tatsächlichen Stand aus, nicht den vermuteten.', 'Orefy reads the actual state, not the assumed one.'),
      benefit: t('Sie sehen zum ersten Mal vollständig, was in Ihrem Account läuft und was davon nirgends dokumentiert ist.', 'For the first time you see completely what runs in your account, and which parts are documented nowhere.'),
      explain: [
        t('Es werden nur lesende Abfragen ausgeführt.', 'Only read queries are made.'),
        t('Was schon als Code verwaltet wird, erkennt Orefy und lässt es unangetastet.', 'Orefy recognises what is already managed as code and leaves it alone.'),
      ],
      ready: run.inspected, next: t('Daraus Code erzeugen', 'Turn it into code'),
    },
    {
      label: t('Code', 'Code'), title: t('Ihre Infrastruktur als Code', 'Your infrastructure in code'),
      lead: t('Aus dem Bestand entsteht lesbarer, geordneter Terraform-Code.', 'The inventory becomes readable, organised Terraform code.'),
      benefit: t('Ihre Infrastruktur ist dokumentiert und lässt sich wieder aufbauen. Der Code ist Standard-Terraform und gehört Ihnen.', 'Your infrastructure is documented and can be rebuilt. The code is standard Terraform and belongs to you.'),
      explain: [
        t('Wo es bewährte Community-Bausteine gibt, werden sie mit fester Version verwendet.', 'Where proven community building blocks exist, they are used with a pinned version.'),
        t('Bestehende Ressourcen werden mit dem Code verknüpft. Nichts wird neu angelegt.', 'Existing resources are linked to the code. Nothing is recreated.'),
      ],
      ready: run.generated, next: t('Beweisen, dass der Code stimmt', 'Prove the code is right'),
    },
    {
      label: t('Beweis', 'Proof'), title: t('Der Beweis: Code und Umgebung stimmen überein', 'The proof: code and environment match'),
      lead: t('Der Code gilt erst als fertig, wenn ein Abgleich keinen Unterschied zeigt.', 'The code only counts as done when a comparison shows no difference.'),
      benefit: t('Sie übernehmen den Code ohne Risiko: Es ist nachgewiesen, dass er nichts an Ihrer Umgebung ändert.', 'You adopt the code without risk: it is proven to change nothing in your environment.'),
      explain: [
        t('Findet der Abgleich einen Unterschied, korrigiert Orefy den Code und prüft erneut.', 'If the comparison finds a difference, Orefy corrects the code and checks again.'),
        t('Bleibt etwas offen, sehen Sie es im Ergebnis, statt es später zu entdecken.', 'If something stays open, you see it in the result instead of discovering it later.'),
      ],
      ready: run.verified, next: t('Weiter: Risiken und Übergabe', 'Next: risks and handover'),
    },
    {
      label: t('Übergabe', 'Handover'), title: t('Risiken beheben und Code übernehmen', 'Fix risks and take over the code'),
      lead: t('Sie erhalten den Code zur Prüfung. Angewendet wird er von Ihnen.', 'You receive the code for review. You apply it yourself.'),
      benefit: t('Sie behalten die Kontrolle: Ihr Team prüft, Ihr Team gibt frei.', 'You stay in control: your team reviews, your team approves.'),
      explain: [
        t('Code und Korrekturen kommen getrennt, damit Sie den risikofreien Teil zuerst übernehmen können.', 'Code and fixes arrive separately so you can adopt the risk-free part first.'),
        t('Jede Korrektur ist eine Änderung am Code, kein Klick in der Konsole.', 'Every fix is a change to the code, not a click in the console.'),
        t('Das Anwenden bleibt ein Schritt, den ein Mensch auslöst.', 'Applying stays a step a person triggers.'),
      ],
      ready: false, next: '',
    },
  ]
  const step = steps[view - 1]
  const props: StepProps = { run, t, update: updateRun }
  const goTo = (n: number) => { updateRun({ step: Math.max(run.step, n) }); setView(n); window.scrollTo(0, 0) }

  let body: ReactNode
  switch (view) {
    case 1: body = <Connect {...props} />; break
    case 2: body = <Scope {...props} />; break
    case 3: body = <Inspect {...props} />; break
    case 4: body = <Generate {...props} />; break
    case 5: body = <Verify {...props} />; break
    default: body = <Handover {...props} />
  }

  return (
    <div className="wizard">
      <ol className="stepper" aria-label={t('Schritte der Demo', 'Steps of the demo')}>
        {steps.map((s, n) => {
          const num = n + 1
          // Done means the visitor moved past the step, or finished the furthest one they reached.
          const state = num === view ? 'current' : num < run.step || (num === run.step && s.ready && num > 2) ? 'done' : 'todo'
          const reachable = num <= run.step
          return (
            <li key={s.label} className={`step step-${state}`} aria-current={num === view ? 'step' : undefined}>
              <button type="button" disabled={!reachable} onClick={() => setView(num)}>
                <span className="step-num">{state === 'done' ? <Icon name="check" size={14} /> : num}</span>
                <span className="step-label">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="wizard-body">
        <section className="panel wizard-main" key={view}>
          <p className="over">{t('Schritt', 'Step')} {view} {t('von', 'of')} {steps.length}</p>
          <h1>{step.title}</h1>
          <p className="lead">{step.lead}</p>
          {view === 3 && !run.inspected && (
            <p className="hint prefilled">
              {t('Account und Umfang sind in der Demo vorbereitet. Beides finden Sie oben in Schritt 1 und 2.', 'Account and scope are prepared in the demo. You find both in steps 1 and 2 above.')}
            </p>
          )}
          {body}
        </section>
        <aside className="explain">
          <h2>{t('Ihr Nutzen', 'Your benefit')}</h2>
          <p className="benefit">{step.benefit}</p>
          <h2><Icon name="info" /> {t('Was passiert hier?', 'What happens here?')}</h2>
          <ul>{step.explain.map((x) => <li key={x}>{x}</li>)}</ul>
          <a className="link" href="#/security">{t('Mehr zur Sicherheit', 'More about security')}</a>
        </aside>
      </div>

      <footer className="wizard-foot">
        {view > 1
          ? <Button icon="arrowLeft" onClick={() => setView(view - 1)}>{t('Zurück', 'Back')}</Button>
          : <Button variant="ghost" onClick={() => go('/')}>{t('Zur Übersicht', 'To overview')}</Button>}
        {view < steps.length && (
          <Button variant="primary" iconRight="arrowRight" disabled={!step.ready} onClick={() => goTo(view + 1)}>{step.next}</Button>
        )}
      </footer>
    </div>
  )
}
