import { useState, type FormEvent } from 'react'
import { CONTACT_EMAIL, CONTACT_ENDPOINT, WEBSITE_URL } from '../demo/data.ts'
import { useStore } from '../demo/store.tsx'
import { track } from '../track.ts'
import { Button, Icon, PageHead, Status } from '../ui.tsx'

export function Contact() {
  const { t } = useStore()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'error'>('idle')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    track('contact_submit')
    if (!CONTACT_ENDPOINT) {
      // No form service configured: hand the request to the visitor's mail program.
      const body = [
        `Name: ${data.name}`, `E-Mail: ${data.email}`, `Firma: ${data.company}`,
        `AWS-Umgebung: ${data.size}`, '', data.message,
      ].join('\n')
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Orefy Early Access')}&body=${encodeURIComponent(body)}`
      setState('mail')
      return
    }
    setState('sending')
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <>
      <PageHead
        title={t('Early Access anfragen', 'Request early access')}
        lead={t('Orefy ist ab Q1 2027 verfügbar. Schreiben Sie uns, wenn Sie früh dabei sein oder Ihre Umgebung besprechen möchten.', 'Orefy is available from Q1 2027. Write to us if you want to be among the first or discuss your environment.')}
      />
      {state === 'sent' ? (
        <div className="banner ok" role="status">
          <Icon name="checkCircle" size={22} />
          <div>
            <b>{t('Danke, Ihre Anfrage ist angekommen.', 'Thank you, your request has arrived.')}</b>
            <span>{t('Wir melden uns bei Ihnen.', 'We will get back to you.')}</span>
          </div>
        </div>
      ) : (
        <form className="panel pad contact" onSubmit={submit}>
          <div className="contact-grid">
            <label className="field"><span>{t('Name', 'Name')}</span><input name="name" required autoComplete="name" /></label>
            <label className="field"><span>{t('Geschäftliche E-Mail', 'Work e-mail')}</span><input name="email" type="email" required autoComplete="email" /></label>
            <label className="field"><span>{t('Firma', 'Company')}</span><input name="company" required autoComplete="organization" /></label>
            <label className="field">
              <span>{t('Größe Ihrer AWS-Umgebung', 'Size of your AWS environment')}</span>
              <select name="size" defaultValue="">
                <option value="">{t('Bitte wählen (optional)', 'Please choose (optional)')}</option>
                <option>{t('1 Account', '1 account')}</option>
                <option>{t('2 bis 10 Accounts', '2 to 10 accounts')}</option>
                <option>{t('Mehr als 10 Accounts', 'More than 10 accounts')}</option>
                <option>{t('Weiß ich nicht', 'I do not know')}</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>{t('Was möchten Sie erreichen? (optional)', 'What do you want to achieve? (optional)')}</span>
            <textarea name="message" rows={4} />
          </label>
          <div className="contact-foot">
            <Button variant="primary" icon="mail" type="submit" busy={state === 'sending'}>
              {CONTACT_ENDPOINT ? t('Anfrage senden', 'Send request') : t('Anfrage per E-Mail senden', 'Send request by e-mail')}
            </Button>
            <span className="hint">
              {!CONTACT_ENDPOINT && t('Öffnet Ihr E-Mail-Programm mit der fertigen Nachricht. ', 'Opens your mail program with the finished message. ')}
              {t('Wir verwenden Ihre Angaben nur, um auf diese Anfrage zu antworten.', 'We use your details only to answer this request.')}{' '}
              <a className="link" href={`${WEBSITE_URL}privacy.html`}>{t('Datenschutz', 'Privacy')}</a>
            </span>
          </div>
          {state === 'mail' && (
            <Status tone="info">
              {t('Kein E-Mail-Programm geöffnet? Schreiben Sie direkt an', 'No mail program opened? Write directly to')}{' '}
              <a className="link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </Status>
          )}
          {state === 'error' && (
            <Status tone="danger">
              {t('Das Senden hat nicht geklappt. Schreiben Sie bitte direkt an', 'Sending failed. Please write directly to')}{' '}
              <a className="link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </Status>
          )}
        </form>
      )}
    </>
  )
}
