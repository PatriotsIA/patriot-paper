# Patriots For Paper — React + Vite site

A sleek, responsive campaign-style site (same theme as the Bond Assassins build) focused on **returning elections to auditable paper ballots**.

## Pages

- `/` — Home
- `/paper-ballots` — Why Paper Ballots
- `/action` — Action Toolkit (includes a pledge form)
- `/request-help` — Request Help (intake form)
- `/about` — About & Support

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Notes

- Forms are **front-end only** right now (validation + toast). Hook up submissions to your backend/API when ready.
- Copy lives in `src/content/siteCopy.ts`.
