# Beta application storage

## Setup (manual migration)

1. In your Supabase project's SQL editor, run
   `supabase/migrations/20261014000000_beta_applications.sql`.
   This creates a new `public.beta_applications` table. It fails rather than
   silently modifying an existing table of the same name.
2. Set these **server-only** environment variables locally and in deployment:
   - `SUPABASE_URL`: your project's HTTPS URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: a backend secret (`sb_secret_…`) or legacy
     service-role key. Never use a publishable/anon key here.
3. Restart the app after changing environment variables. Never commit `.env*`
   or prefix the secret with `NEXT_PUBLIC_`.
4. Submit your own test application on `/beta` (or `/fr/beta`, `/ar/beta`,
   `/ary/beta`) and inspect the table in the Supabase dashboard. Verify all
   answers, the consent timestamp, locale and submission timestamp.

The migration has **not** been applied by the coding agent. Automated tests
mock Supabase and Resend, and do not create real applicants or send email.

## Request behavior

- The existing form still posts to `/api/waitlist` with `source: "beta"`.
- Validation, consent, honeypot protection, localized errors and per-instance
  rate limiting remain in place. IP addresses are not stored.
- Supabase must save the validated answers before the route returns success.
  Missing configuration returns `not_configured` (503); storage failure returns
  `application_failed` (502), displayed in the visitor's language.
- A normalized email identifies one application. Retries succeed without
  replacing the first answers, timestamps or language. Duplicate requests do
  not resend notifications. The public API cannot edit existing applications.
- After a new save, Resend contact sync, team notification and localized
  confirmation are attempted if `RESEND_API_KEY` is configured. Mail failures
  are logged without personal information; they do not undo the database save.
  Failed mail is not automatically retried: review applications in Supabase.
- Plain waitlist and simulator-interest signups still use the Resend Audience
  and require `RESEND_API_KEY`; they do not write to the beta table.

## Access and privacy

RLS is enabled, with no visitor policies. Public, anon and authenticated roles
have no table grants. The backend service role has SELECT/INSERT only. Review
and manage applications in the Supabase dashboard as the database owner.
Choose a retention period for applicant personal data and delete it using an
authorized administrative process; there is no public read/delete endpoint.
The existing per-instance rate limiter is not distributed across instances.

## Rollback

Redeploy the previous handler first. If necessary, manually run
`supabase/rollback/20261014000000_beta_applications.sql` **after exporting the
data**. This drops the table and permanently deletes all stored applications.
