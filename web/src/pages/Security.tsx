import { useStore } from '../demo/store.tsx'
import { Button, PageHead } from '../ui.tsx'
import { Rights, type Go } from './shared.tsx'

export function Security({ go }: { go: Go }) {
  const { t } = useStore()
  const faq: [string, string][] = [
    [
      t('Kann Orefy in meinem Account etwas kaputt machen?', 'Can Orefy break anything in my account?'),
      t(
        'Nein. Die Rolle, die Sie Orefy geben, erlaubt nur lesende Zugriffe. Zusätzlich lässt das Werkzeug selbst nur lesende Aufrufe zu. Diese Grenze ist technisch erzwungen und hängt nicht davon ab, dass sich eine KI an eine Anweisung hält.',
        'No. The role you give Orefy only allows read access. On top of that the tooling itself only permits read calls. This limit is technically enforced and does not depend on an AI following an instruction.',
      ),
    ],
    [
      t('Sieht die KI meine Passwörter und Schlüssel?', 'Does the AI see my passwords and keys?'),
      t(
        'Nein. Aufrufe, die Inhalte von Geheimnissen liefern würden, sind gesperrt. Was dennoch nach einem Geheimnis aussieht, wird geschwärzt, bevor es ein Modell, eine Datei oder ein Protokoll erreicht.',
        'No. Calls that would return the contents of secrets are blocked. Anything that still looks like a secret is redacted before it reaches a model, a file or a log.',
      ),
    ],
    [
      t('Was, wenn der erzeugte Code falsch ist?', 'What if the generated code is wrong?'),
      t(
        'Dann fällt es auf, bevor Sie ihn bekommen. Der Code wird gegen Ihre Live-Umgebung abgeglichen. Erst wenn dieser Abgleich keinen Unterschied zeigt, gilt ein Lauf als erfolgreich. Abweichungen sehen Sie im Ergebnis.',
        'Then it shows before you receive it. The code is compared against your live environment. A run only counts as successful when that comparison shows no difference. You see any deviations in the result.',
      ),
    ],
    [
      t('Wer wendet den Code an?', 'Who applies the code?'),
      t(
        'Sie. Orefy liefert den Code zur Prüfung, zum Beispiel als Pull Request. Das Anwenden bleibt ein Schritt, den ein Mensch in Ihrem Team auslöst.',
        'You do. Orefy delivers the code for review, for example as a pull request. Applying it stays a step that a person on your team triggers.',
      ),
    ],
    [
      t('Bin ich danach von Orefy abhängig?', 'Am I locked in to Orefy afterwards?'),
      t(
        'Nein. Das Ergebnis ist gewöhnlicher Terraform-Code mit offenen Community-Modulen. Er liegt in Ihrem Repository und funktioniert ohne Orefy weiter.',
        'No. The result is ordinary Terraform code with open community modules. It lives in your repository and keeps working without Orefy.',
      ),
    ],
    [
      t('Kann ich den Zugriff wieder entziehen?', 'Can I revoke access again?'),
      t(
        'Jederzeit. Sie löschen die Rolle in Ihrem Account, damit endet der Zugriff sofort.',
        'At any time. You delete the role in your account and access ends immediately.',
      ),
    ],
  ]
  return (
    <>
      <PageHead
        title={t('Sicherheit', 'Security')}
        lead={t('Sie geben einem Werkzeug Zugriff auf Ihre Infrastruktur. Das hier sind die Grenzen, die dabei gelten.', 'You give a tool access to your infrastructure. These are the limits that apply.')}
        actions={<Button variant="primary" iconRight="arrowRight" onClick={() => go('/contact')}>{t('Fragen dazu? Schreiben Sie uns', 'Questions? Write to us')}</Button>}
      />
      <section className="panel pad">
        <h2>{t('Nur Lesezugriff', 'Read-only access')}</h2>
        <Rights />
      </section>
      <section className="panel faq">
        <div className="panel-head"><h2>{t('Häufige Fragen', 'Common questions')}</h2></div>
        {faq.map(([q, a], n) => (
          <details key={q} open={n === 0}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  )
}
