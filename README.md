# Patriots For Paper

A React + TypeScript campaign site for auditable paper ballots, built with Vite
and Tailwind CSS. Its visual style follows Recover America's navy, red, and
serif typography, with responsive layouts and reduced-motion support.

## Pages

- `/` — Home
- `/paper-ballots` — Why Paper Ballots
- `/action` — Action Toolkit and pledge form
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

The pledge and help forms validate input and send through EmailJS. Configure the
`VITE_EMAILJS_*` values listed in `.env.example` locally or in Amplify. Never
commit `.env` or credentials. The help form requires SMS consent when a phone
number is provided. An unused platform API helper is not the active form transport.

## Hosting

AWS Amplify app `d2pqbeealr8kyx` in `us-west-2` builds and publishes pushes to `main`.
The build runs `npm ci` and `npm run build`, publishes `dist`, and rewrites unknown
paths to `index.html` for client-side routing.

Current hosting URL: https://main.d2pqbeealr8kyx.amplifyapp.com/

Custom domain setup for `patriotsforpaper.com` and `www.patriotsforpaper.com` has
been initiated in Amplify. The remaining GoDaddy DNS entries and verification
steps are in [docs/domain-setup.md](docs/domain-setup.md).
