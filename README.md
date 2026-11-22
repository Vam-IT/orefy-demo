# Orefy Demo

Public, interactive demo of the Orefy workflow for prospective customers: connect an AWS account, inspect it, generate
modular Terraform with `import` blocks, verify down to Zero-diff, review findings and hand the code over. It mirrors
what the [agent harness](https://github.com/Vam-IT/orefy-agent-harness) does and uses its vocabulary and module table.

**Everything is simulated in the browser.** There is no backend, no sign-in, no AWS call and no real run. All data is
invented. Features that do not exist yet carry a "Planned" label, and the "Feature scope" page lists what is in
development and what is planned.

Served at `https://demo.orefy.cloud` from GitHub Pages.

## Layout

| Path | Purpose |
|---|---|
| `web/src/demo/` | Example data, Terraform code generation, run state |
| `web/src/wizard/` | The six-step guided run |
| `web/src/pages/` | Start/overview, runs, inventory, code, findings, security, feature scope, contact |
| `web/src/shell/` | Top bar, navigation, legal footer |
| `web/src/logos.ts` | Brand marks (AWS, Terraform, GitHub, GitLab, AWS services), SVG paths from Simple Icons (CC0) |
| `web/public/CNAME` | Custom domain for GitHub Pages |
| `.github/workflows/pages.yml` | Lint, build and deploy to GitHub Pages |

## Local development

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build
```

## Links for sales conversations

| Parameter | Effect |
|---|---|
| `?company=Muster%20AG` | Shows the prospect's name as the target instead of "Demo GmbH" (max. 40 characters). |
| `?lang=en` | Opens the demo in English. The embed on orefy.cloud uses it. |
| `?fast` | Shortens the simulated waiting times, for live presentations. |

Both can be combined: `https://demo.orefy.cloud/?company=Muster%20AG&fast`.

## Optional build settings

Set these as repository variables (Settings → Secrets and variables → Actions → Variables). None is a secret.

| Variable | Effect |
|---|---|
| `VITE_CONTACT_ENDPOINT` | URL that accepts the contact form as a JSON POST (for example Formspree). Without it the form opens the visitor's mail program with a prepared message to `info@orefy.cloud`. |
| `VITE_ANALYTICS_SRC` | Script URL of a cookieless statistics tool that exposes `window.plausible`. Without it no statistics load. |
| `VITE_ANALYTICS_DOMAIN` | Value for the script's `data-domain` attribute, if the tool needs one. |

Events sent when statistics are on: `pageview` (with the page), `demo_step` (1–6, 7 = finished) and `contact_submit`.
Check the privacy policy before turning either setting on.

## Writing for visitors

The demo addresses decision makers first. Each step states the benefit in plain language; Terraform terms carry an
explanation on hover (`<Term>`, texts in `TERMS` in `web/src/demo/data.ts`) and command names stay in the detail column.

## Keeping the demo honest

The demo is public, so everything in it is a public statement about the product.

- Do not put customer data or secrets into this app.
- Mark anything that is not built yet as planned (`<Planned />`).
- Do not show time or cost savings that are not backed by real runs.
- The security page only states what the harness enforces today. Add claims about where data is processed or which
  model is used only once they are decided for the product.
- Module sources and versions in `web/src/demo/data.ts` mirror `modules.yaml` in the harness; update them together.

## First-time setup

1. Create the repository as **public** (GitHub Pages on the Free plan only serves public repositories) and push.
2. Settings → Pages → Source "GitHub Actions".
3. DNS at Strato for `orefy.cloud`: `CNAME demo → vam-it.github.io`.
4. Once the certificate is issued, enable "Enforce HTTPS" in the Pages settings.

The legal footer links to the imprint and privacy policy on `orefy.cloud`. The demo stores nothing on the
visitor's device, as that privacy policy promises; a reload starts over. Nothing is sent to a server.

The demo is embedded on `orefy.cloud` in an iframe that loads on click, so links to other pages need `target="_blank"`.
