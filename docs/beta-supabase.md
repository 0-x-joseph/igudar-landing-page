# Beta application, lead and analytics storage

All landing-site storage goes to the beta Supabase project through the
server-only service-role client (`lib/supabase/service-client.ts`). The browser
never talks to Supabase directly.

## What is stored where

| Data | Table | Written by | Schema owned by |
|---|---|---|---|
| Closed-beta applications (`/beta` form): email, first name, city/country, amount range, experience, consent time, locale, plus visitor id, page and UTM values | `public.beta_applications` | `/api/waitlist` (`source: "beta"`) | this repo's `supabase/migrations/20261014000000_beta_applications.sql`; the attribution columns are added by the app repo |
| Waitlist modal sign-ups (navbar, final CTA, FAQ): email, consent time, locale, visitor id, page, UTM values | `public.landing_leads`, `form = 'waitlist_modal'` | `/api/waitlist` (no interest fields) | app repo |
| Simulator interest: email, consent time, locale, visitor id, page, UTM values, `props` `{amount_bucket, scenario}` (never the exact amount) | `public.landing_leads`, `form = 'simulator_interest'` | `/api/waitlist` (`source: "simulator"`) | app repo |
| Anonymous behaviour: page views, CTA clicks, form views/starts/submits/errors, simulator and calculator events, language changes | `public.landing_events` | `/api/events` (browser sender in `lib/analytics.ts`) | app repo |

The founders read all of this in the app's admin area (funnel, form
submissions, property interest) through the app repo's RPCs.

### What is never stored

- No IP address and no user-agent string, in any table or log. The IP is only
  held in memory for per-instance rate limiting.
- No email, name, location text or exact amount in an event. Event props are
  buckets and stable ids only; the browser drops an event whose props break the
  rules in `lib/acquisition.ts`, and `/api/events` drops it again.
- No query string: events and leads carry the pathname only. UTM values are
  read from the session's first page and kept as three separate short fields.
- The visitor id is a random UUID in the visitor's `localStorage`
  (`igudar_vid`); the session id is a random UUID in `sessionStorage`
  (`igudar_sid`). Neither is derived from anything personal. A visitor id is
  only linked to an email when that visitor submits a form.

### Do Not Track and Global Privacy Control

When the browser sends Do Not Track (`navigator.doNotTrack === "1"`) or Global
Privacy Control (`navigator.globalPrivacyControl === true`), the site sends no
events and stores no visitor id, session id or UTM values. A form submitted from
such a browser is still saved (the visitor asked to be contacted), with its page
but without a visitor id or campaign values.

## Setup

1. **Apply the app repo's migration first.** The schema for `landing_events`,
   `landing_leads` and the new nullable `beta_applications` columns
   (`visitor_id`, `path`, `utm_source`, `utm_medium`, `utm_campaign`) lives in
   the app repo (0-x-joseph/igudar),
   `supabase/migrations/20261014000400_acquisition_analytics.sql`. It must be
   applied to the beta project **before this branch is deployed**. Without it:
   - the waitlist modal and simulator interest forms show the localized
     "could not save" error (`application_failed`) to every visitor;
   - beta applications fail the same way: the form always sends its page
     (`path`), a column that does not exist yet;
   - every analytics event is dropped silently (`/api/events` always answers
     204).
   This repo holds no SQL for these tables; do not add any here.
2. `beta_applications` itself still comes from this repo's
   `supabase/migrations/20261014000000_beta_applications.sql` (already applied
   on the beta project). It fails rather than silently modifying an existing
   table of the same name.
3. Set these **server-only** environment variables locally and in deployment:
   - `SUPABASE_URL`: your project's HTTPS URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: a backend secret (`sb_secret_…`) or legacy
     service-role key. Never use a publishable/anon key here.
4. Restart the app after changing environment variables. Never commit `.env*`
   or prefix the secret with `NEXT_PUBLIC_`.
5. Check each path once in the Supabase dashboard: submit the waitlist modal,
   the simulator interest form and a beta application (in any of `/`, `/fr`,
   `/ar`, `/ary`), browse a few pages, and inspect `landing_leads`,
   `beta_applications` and `landing_events`.

No migration has been applied by the coding agent. Automated tests mock
Supabase and Resend, and do not create real leads or send email.

## Request behavior

### `/api/waitlist` (all three forms)

- Validation, honeypot protection, localized errors and per-instance rate
  limiting apply to every form. **Consent is required for all three forms**
  (the waitlist modal gained the same consent box; missing or invalid consent
  answers `consent_required` / `consent_invalid`).
- Every validated submission is saved in Supabase before the route returns
  success and before any email work. Missing configuration returns
  `not_configured` (503); a storage failure returns `application_failed` (502),
  displayed in the visitor's language. A lead is never lost silently.
- A normalized email identifies one beta application, and one lead per form
  (`UNIQUE (email, form)`). Retries succeed without replacing the first answers,
  timestamps or language, and do not resend notifications. The public API
  cannot edit existing rows.
- After a new save, Resend contact sync, team notification and localized
  confirmation are attempted if `RESEND_API_KEY` is configured. Mail failures
  are logged without personal information; they do not undo the database save
  and are not retried: review submissions in Supabase or the admin area.
- Visitor id, page and UTM values are optional on every form and are dropped
  silently when malformed (they never make a sign-up fail).

### `/api/events` (anonymous behaviour)

- The browser queues events in memory and sends them at most 5 s later, when 20
  are waiting, or when the page is hidden or left, with `navigator.sendBeacon`
  (fallback `fetch` with `keepalive`).
- The route accepts at most 20 events and 16 KB per request, validates every
  field against the contract (`lib/acquisition.ts`), drops invalid events,
  rate-limits per instance (30 requests per minute per IP, in memory) and
  inserts the valid ones in one request.
- It always answers 204, never logs personal data and never blocks a page.
  Without Supabase configuration it stores nothing and still answers 204.

## Access and privacy

RLS is enabled on all three tables, with no visitor policies. Public, anon and
authenticated roles have no table grants. The backend service role has
SELECT/INSERT only. The admin area reads aggregates and form submissions through
the app repo's permission-checked RPCs.

To decide (founders):

- **Retention.** Choose a retention period for leads, applications and events
  and delete old rows with an authorized administrative process; there is no
  public read/delete endpoint.
- **Privacy notice.** The site now records anonymous behaviour and links a
  visitor id to a form submission. The privacy notice should say so; the footer
  privacy link is still `#`. Writing that text is the founders' call.

The per-instance rate limiters are not distributed across instances.

## Rollback

Redeploy the previous handler first. The app repo owns the rollback of the
acquisition tables and columns. If necessary, manually run
`supabase/rollback/20261014000000_beta_applications.sql` **after exporting the
data**. This drops the beta table and permanently deletes all stored
applications.
