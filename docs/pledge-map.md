# National pledge map

Launched with new pledges only; no historical emails were imported. The map is
on the home and action pages. The user's instruction to preserve existing copy
continues to apply to existing material; this feature adds map labels, county
selection and submission feedback.

## Geography and behavior

The catalog and polygons come from the Census Bureau's **2025 cartographic
boundary files, 1:20,000,000**:

- https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_county_20m.zip
- https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_state_20m.zip
- https://www.census.gov/geographies/mapping-files/2025/geo/carto-boundary-file.html

There are **3,222 counties/equivalents** in **50 states, D.C., and Puerto Rico**:
3,144 in the states/D.C. plus 78 Puerto Rico municipios. This includes Alaska's
current boroughs/census areas, Louisiana parishes, Virginia independent cities,
and Connecticut's nine planning regions. Other U.S. territories are outside
this county dataset. These generalized boundaries are for display, not address
geocoding or legal boundary determinations.

Every county uses the same five-digit FIPS identifier in the form, map and API.
The form requires an explicit state selection, then a county from that state.
Changing the state clears the county. The server validates the pair independently
and resolves the canonical name itself. Free-text county names cannot be counted.
This validates the selected geography, not the signer's physical residency.

The national map has Alaska, Hawaii and Puerto Rico insets. Selecting a county
opens its state. State views show count labels where space permits; the searchable
list exposes every county, including small independent cities. State selection,
search, zoom, pan and reset work without a mapping service or API key. Map code
and state geometry load on demand. Search ignores accents and supports full
state names, abbreviations and county identifiers.

`public/maps/provenance.json` records the source vintage and catalog hash.
To regenerate, download and unzip both archives into one directory, then run:

```bash
npm ci
node scripts/build-geography.mjs /path/to/census-shapefiles
```

The generator explicitly reads UTF-8 DBF names. Commit the generated files in
`src/data`, `public/maps` and `backend/counties.json` together. Geography tests
require identical sets of county identifiers across all three outputs.

## API and storage

CloudFormation stack: `patriot-paper-pledges`, AWS profile `pia`, region `us-west-2`.
Public endpoint is stored in `src/config/pledge-api.json`; `VITE_PLEDGE_API_URL`
can override it for development. Credentials never go in the frontend.

- `GET /counts` returns county counts, derived state/national summaries, and timestamps.
- `POST /pledges` accepts name, email, state, countyFips, optional role, privacy
  consent and a honeypot. It returns only `{ "accepted": true }` for both new
  and duplicate valid pledges.
- There is no public list, lookup or export of personal pledge records.

Private records have `pk = PLEDGE#<sha256(normalized email)>`, `sk = PROFILE`.
The map's aggregate snapshot is `pk = PUBLIC`, `sk = COUNTS`. A DynamoDB
transaction conditionally inserts the private record and increments the county
counter together. Repeated email addresses, including changes in case or outer
whitespace, count once; retries cannot increment again or change the original
county. Names/emails are not verified with an inbox confirmation. Counts mean
accepted, deduplicated pledges, not independently verified people.

A strongly consistent read fetches the aggregate snapshot; all summaries are
derived from that same snapshot. The browser refreshes every 30 seconds while
visible, on returning to the tab, after a successful pledge, or on manual refresh.
A failed request shows an error and retains last-known totals. An initial failure
shows unavailable totals, never fabricated zeros. Map geometry failures leave
the searchable county list available.

The pledge is committed before the existing client-side EmailJS notification.
A notification failure does not undo the pledge; the browser reports that it was
saved. EmailJS delivery is best-effort and has no new durable retry queue. The
help request flow is unchanged. AWS operators can retrieve private records using
authorized DynamoDB access if an email notification is missed.

Controls include exact-origin CORS, server-side validation, a honeypot, API
Gateway throttling, and per-IP request limits (10/minute and 100/day). Raw IPs are
not stored; short-lived window-specific hashes expire via DynamoDB TTL. These
are basic abuse controls, not identity verification or a CAPTCHA. Browser CORS
is not an authentication boundary. The table has encryption, point-in-time
recovery, deletion protection and CloudFormation retention. No request bodies
or contact details are logged. Operational alarms send to the standing PIA
address, `erik@patriotsinaction.com`; its active SNS subscription was confirmed.

The account's Lambda quota is 10 concurrent executions. This function uses the
shared unreserved pool; the deployment does not change account quotas or reserve
capacity from existing applications. API throttles are configured in the stack.

## Deploy and verify

Create a Python virtual environment and install `backend/requirements-dev.txt`.

```bash
python -m pytest backend/tests -q
npm run build
npm run lint
python backend/deploy.py             # print the reviewable template
python backend/deploy.py --deploy    # deploy API and update public URL config
```

The script creates an application-scoped private S3 code-artifact bucket and
CloudFormation resources. Bucket names contain the account identifier, resolved
at runtime. It never resets an existing counts record. Read `backend/infrastructure.py`
before changing resources; the data table is retained on stack deletion.
The frontend still publishes via Amplify when changes are pushed to `main`.

For an explicit pre-release integration check:

```bash
python backend/verify-live.py --verify
```

This creates one temporary synthetic pledge through the real API, verifies
atomic counting, deduplication, state validation, CORS and privacy, then removes
only that fixture and its count in a conditional transaction. It sends no email.
Do not run it as a routine production health check. Use read-only `GET /counts`
for ongoing monitoring. The pre-launch check completed and restored zero real
pledges before publishing the new frontend.

Browser review covered national and state coverage, equal-name counties in
multiple states, county reset on state changes, mocked form submission and map
refresh, empty/error/stale states, geometry failure fallback, keyboard selection,
zoom/pan/reset, and mobile layout. All form notification tests were intercepted;
no synthetic notification emails were sent.

Two failed initial stacks (resource ordering, then the account concurrency quota)
were rolled back. Their empty retained tables and failed stack records were
removed; the final stack is the one named above.
