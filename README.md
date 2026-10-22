# Patriots For Paper

A React + TypeScript campaign site for auditable paper ballots, built with Vite
and Tailwind CSS. Its visual style follows Recover America's navy, red, and
serif typography, with responsive layouts and reduced-motion support.

## Pages

- `/` — Home; national pledge map and pledge form immediately beneath the hero
- `/paper-ballots` — Why Paper Ballots
- `/action` — Action Toolkit, pledge form and live national pledge map
- `/request-help` — Help request form
- `/about` — About & Support
- `/privacy` and `/terms` — Legal pages

## Development

Use Node.js 22 or newer.

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run preview
```

Most copy lives in `src/content/siteCopy.ts`; additional page and legal text lives
in the page components. Design tokens are in `tailwind.config.js`, shared styles
in `src/index.css`, and reusable components in `src/components`.

The pledge form saves a private record and county total in the pledge API, then
sends the existing EmailJS notification. The help form sends through EmailJS. Configure the
`VITE_EMAILJS_*` values listed in `.env.example` locally or in Amplify. Never
commit `.env` or credentials. The help form requires SMS consent when a phone
number is provided. An unused platform API helper is not the active form transport.

The map starts with new pledges and refreshes every 30 seconds and after a
submission. It covers all 50 states, D.C., and Puerto Rico, using Census 2025
county FIPS identifiers. The API validates county/state pairs and counts each
normalized email once. Public responses contain aggregates only.

The home and action pages share `src/components/pledges/PledgeSection.tsx`.
Both place the map and pledge form directly below their hero. The shared form
preserves the existing wording, storage and EmailJS behavior.

See [docs/pledge-map.md](docs/pledge-map.md) for data provenance, architecture,
deployment, verification, and operating notes.

## Hosting

AWS Amplify app `d2pqbeealr8kyx` in `us-west-2` builds and publishes pushes to `main`.
The build runs `npm ci` and `npm run build` and publishes `dist`. Amplify uses
the HTTP 200 SPA rewrite saved in [docs/amplify-rewrites.json](docs/amplify-rewrites.json)
so direct page visits work, while assets retain their own responses. This rule
is configured on the Amplify app; it is not automatically read from the repository.

Current hosting URL: https://main.d2pqbeealr8kyx.amplifyapp.com/

Custom domain setup for `patriotsforpaper.com` and `www.patriotsforpaper.com` has
been initiated in Amplify. The remaining GoDaddy DNS entries and verification
steps are in [docs/domain-setup.md](docs/domain-setup.md).
