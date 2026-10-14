-- Apply manually in the Supabase SQL editor before deploying the beta handler.
-- New table only: no changes to auth.users or any existing platform tables.
begin;

create table public.beta_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  location text not null,
  ticket_bucket text not null,
  experience text not null,
  consent_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  locale text not null default 'en',
  source text not null default 'beta',
  constraint beta_email_normalized check (
    email = lower(btrim(email)) and char_length(email) between 3 and 254
    and email ~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
  ),
  constraint beta_first_name_length check (char_length(btrim(first_name)) between 1 and 60),
  constraint beta_location_length check (char_length(btrim(location)) between 1 and 80),
  constraint beta_ticket_bucket_valid check (ticket_bucket in ('25-50k', '50-100k', '100-250k', '250k-plus', 'not-sure')),
  constraint beta_experience_valid check (experience in ('new', 'some', 'experienced')),
  constraint beta_locale_valid check (locale in ('en', 'fr', 'ar', 'ary')),
  constraint beta_source_valid check (source = 'beta')
);

-- No public policies: visitors must use the validated, rate-limited API route.
-- Supabase service_role bypasses RLS; only INSERT + SELECT are needed for the
-- conflict-ignore insert and its returned id. Clients cannot read applicants.
alter table public.beta_applications enable row level security;
revoke all on table public.beta_applications from public, anon, authenticated, service_role;
grant select, insert on table public.beta_applications to service_role;

comment on table public.beta_applications is 'Closed-beta applications with explicit consent; server-only access.';
commit;
