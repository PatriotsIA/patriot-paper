# Public first-name lists — October 23, 2026

The list below the map shows all opted-in supporters by default, newest first.
Selecting a county filters to that county; Show all counties clears the selection.
It scrolls independently and loads 40 names per request, with an accessible
Load more names button, retry, empty and end-of-list states. Repeated first names
are separate supporters. Requests from an earlier selection cannot replace the
current county's list. A successful pledge refreshes the selected county list.

## Consent and existing records

Both sites previously promised private names. On October 23 the site owner
confirmed separate permission from existing signers. `backend/publish_existing.py`
publishes only those legacy profiles without an existing name-sharing preference,
using the first whitespace-separated name token and retaining the original county.
Its conditional transaction records the permission source and timestamp, creates
the two public projections, and never changes counts. Dry-run is the default;
`--apply --permission-confirmed` is required to write. Re-running is idempotent,
and any explicit true/false preference is excluded. An unchecked optional form checkbox explicitly authorizes a
chosen first name and county/state to appear publicly. The signer supplies that
first name separately; full names are never split or exposed by the read API.
Missing/false consent saves a private pledge that still counts. Re-submitting
an existing email does not change its original county or public-name consent.
The stored public-name consent version is `2026-10-23`.

## Storage and API

`GET /supporters?county=48381&limit=40&cursor=...` returns only `items`
(`id`, `firstName`, `countyFips`) and `nextCursor`. Omit county for all counties.
IDs are random UUIDs, unrelated to the private email digest. The public API never
returns email, full name, volunteer interest, private keys, or notification data.
Limit is bounded to 1–50. Cursors encode only the public sort key and cannot choose
another database partition. Invalid counties, limits and cursors return 400.

Opted-in pledges atomically write the private profile, count, and two minimal
public projections in the existing table: `SUPPORTERS#ALL` and
`SUPPORTERS#COUNTY#<FIPS>`. Sort keys are timestamp plus random UUID; the endpoint
uses strongly consistent DynamoDB Query, not scans or private-profile filtering.
No table/index replacement is required. Legacy publication is a separate, explicitly authorized step. Duplicate and
failed transactions create neither extra counts nor stray public names.

For an authorized name removal, read the private profile's `publicNameSortKey`
and original county, then delete exactly those two public projections and mark
`publishFirstName` false on the private profile. Retain the pledge/count unless
the person also requests pledge deletion. The contact link in the privacy notice
provides the removal request channel. No public edit/delete endpoint is exposed.

## Verification

Backend tests cover consent, private defaults, duplicate behavior, atomic
rollback, first-name-only responses, pagination, county isolation and invalid
cursors. `scripts/check-supporter-names.mjs` checks desktop/mobile infinite
scroll, county selection and clearing, empty/error/retry states, safe text
rendering, and opt-in form submission. Run with `PLAYWRIGHT_MODULE` pointing to
an installed Playwright module; optionally set `CHECK_URL`. Browser tests
intercept API and email calls and do not create real pledges or send emails.
