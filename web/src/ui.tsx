import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useStore } from './demo/store.tsx'
import { TERMS, type Service, type Severity, type TermKey } from './demo/data.ts'
import { LOGOS, type LogoName } from './logos.ts'

// Lucide outlines, inlined so the app ships without an icon dependency.
const ICONS = {
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  arrowLeft: <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  reset: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
  logout: <><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></>,
  lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  download: <><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></>,
  pullRequest: <><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M6 9v12" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  circle: <circle cx="12" cy="12" r="10" />,
  spinner: <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
  dashboard: <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>,
  list: <><path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" /></>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></>,
  code: <><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>,
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  network: <><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></>,
  file: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></>,
  play: <path d="m6 3 14 9-14 9z" />,
  printer: <><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  mail: <><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></>,
  bell: <><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /></>,
  layers: <><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></>,
}

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 16, spin }: { name: IconName; size?: number; spin?: boolean }) {
  return (
    <svg
      className={spin ? 'icon spin' : 'icon'}
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

// Near-black brand colours would vanish on dark surfaces, so these marks follow the text colour.
const MONO: LogoName[] = ['aws', 'github']

/** A brand mark. Decorative by default; pass `label` when the logo stands alone without text. */
export function Logo({ name, size = 16, label }: { name: LogoName; size?: number; label?: string }) {
  const logo = LOGOS[name]
  return (
    <svg
      className="logo" width={size} height={size} viewBox="0 0 24 24"
      fill={MONO.includes(name) ? 'currentColor' : logo.hex}
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    >
      <path d={logo.path} />
    </svg>
  )
}

const SERVICE_LOGO: Record<Service, LogoName | null> = { ec2: 'ec2', s3: 's3', iam: 'iam', lambda: 'lambda', sqs: 'sqs', sns: null, dynamodb: 'dynamodb' }

/** Service mark for the inventory; SNS has no published mark and uses a neutral icon. */
export function ServiceLogo({ service, size = 16 }: { service: Service; size?: number }) {
  const name = SERVICE_LOGO[service]
  return name ? <Logo name={name} size={size} /> : <span className="logo-fallback"><Icon name="bell" size={size} /></span>
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: IconName
  iconRight?: IconName
  busy?: boolean
}

export function Button({ variant = 'secondary', icon, iconRight, busy, children, disabled, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`btn btn-${variant}`} disabled={disabled || busy} {...rest}>
      {busy ? <Icon name="spinner" spin /> : icon && <Icon name={icon} />}
      {children}
      {iconRight && <Icon name={iconRight} />}
    </button>
  )
}

/** A technical term with its plain-language explanation on hover, focus or tap. */
export function Term({ k, children }: { k: TermKey; children: ReactNode }) {
  const { lang } = useStore()
  return <span className="term" tabIndex={0} data-tip={TERMS[k][lang]}>{children}</span>
}

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral'

const TONE_ICON: Record<Tone, IconName> = { ok: 'checkCircle', warn: 'alert', danger: 'alert', info: 'info', neutral: 'circle' }

/** A status is always icon plus text, never colour alone. */
export function Status({ tone, icon, children }: { tone: Tone; icon?: IconName; children: ReactNode }) {
  return (
    <span className={`status status-${tone}`}>
      <Icon name={icon ?? TONE_ICON[tone]} size={14} />
      {children}
    </span>
  )
}

/** Marks functions that are shown in the demo but not built yet. */
export function Planned() {
  const { t } = useStore()
  return (
    <span className="status status-planned" title={t('Diese Funktion ist geplant und in der Demo simuliert.', 'This feature is planned and simulated in the demo.')}>
      <Icon name="clock" size={14} />
      {t('Geplant', 'Planned')}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useStore()
  const map = {
    high: ['danger', t('Hoch', 'High')],
    medium: ['warn', t('Mittel', 'Medium')],
    low: ['info', t('Niedrig', 'Low')],
  } as const
  const [tone, label] = map[severity]
  return <Status tone={tone}>{label}</Status>
}

export function PageHead({ title, lead, actions }: { title: ReactNode; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options, label }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  label: string
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Light-weight HCL colouring: comments, strings, block keywords and attribute names. */
export function Hcl({ code }: { code: string }) {
  return (
    <pre className="code" tabIndex={0}>
      {code.split('\n').map((line, n) => (
        <span key={n} className="code-line">{colour(line)}{'\n'}</span>
      ))}
    </pre>
  )
}

function colour(line: string): ReactNode {
  if (line.trimStart().startsWith('#')) return <span className="c">{line}</span>
  const out: ReactNode[] = []
  const attr = /^(\s*)([A-Za-z_][\w-]*)(\s*=)/.exec(line)
  let rest = line
  if (attr) {
    out.push(attr[1], <span key="a" className="a">{attr[2]}</span>, attr[3])
    rest = line.slice(attr[0].length)
  } else {
    const kw = /^(\s*)(module|resource|import|terraform|provider|variable|required_providers)\b/.exec(line)
    if (kw) {
      out.push(kw[1], <span key="k" className="k">{kw[2]}</span>)
      rest = line.slice(kw[0].length)
    }
  }
  rest.split(/("[^"]*")/).forEach((part, n) => {
    out.push(part.startsWith('"') ? <span key={`s${n}`} className="s">{part}</span> : part)
  })
  return out
}
