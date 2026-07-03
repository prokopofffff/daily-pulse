-- Daily Pulse — initial schema
-- Mirrors src/lib/types.ts. All tenant tables are scoped by org_id with RLS.

create extension if not exists "pgcrypto";

-- Membership: which auth users belong to which organization.
-- Used by RLS policies to scope every tenant table.
create table if not exists public.organizations (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  timezone    text not null default 'America/Los_Angeles',
  report_time text not null default '08:00',
  accent_color text not null default '#2563EB',
  logo_url    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.organization_members (
  org_id  text not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role    text not null default 'member',
  primary key (org_id, user_id)
);

create table if not exists public.metrics (
  id             text primary key,
  org_id         text not null references public.organizations(id) on delete cascade,
  key            text not null,
  label          text not null,
  date           date not null,
  value          double precision not null,
  previous_value double precision,
  delta_pct      double precision,
  format         text not null default 'number',
  source         text not null default 'manual'
);
create index if not exists metrics_org_id_idx on public.metrics(org_id);

create table if not exists public.metric_points (
  id         uuid primary key default gen_random_uuid(),
  org_id     text not null references public.organizations(id) on delete cascade,
  metric_key text not null,
  label      text not null,
  date       date not null,
  value      double precision not null
);
create index if not exists metric_points_org_key_idx
  on public.metric_points(org_id, metric_key);

create table if not exists public.reports (
  id           text primary key,
  org_id       text not null references public.organizations(id) on delete cascade,
  period       text not null default 'daily',
  title        text not null,
  date         date not null,
  summary      text not null default '',
  body         text not null default '',
  metrics      jsonb not null default '[]'::jsonb,
  insight_ids  jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  status       text not null default 'ready'
);
create index if not exists reports_org_id_idx on public.reports(org_id);

create table if not exists public.insights (
  id          text primary key,
  org_id      text not null references public.organizations(id) on delete cascade,
  report_id   text references public.reports(id) on delete set null,
  category    text not null default 'executive_summary',
  sentiment   text not null default 'positive',
  title       text not null,
  body        text not null default '',
  confidence  double precision not null default 0,
  detected_at timestamptz not null default now()
);
create index if not exists insights_org_id_idx on public.insights(org_id);

create table if not exists public.recommended_actions (
  id        text primary key,
  org_id    text not null references public.organizations(id) on delete cascade,
  report_id text references public.reports(id) on delete set null,
  priority  text not null default 'medium',
  title     text not null,
  body      text not null default '',
  cta_label text not null default 'Review'
);
create index if not exists recommended_actions_org_id_idx
  on public.recommended_actions(org_id);

create table if not exists public.integrations (
  id             text primary key,
  org_id         text not null references public.organizations(id) on delete cascade,
  provider       text not null,
  name           text not null,
  description    text not null default '',
  status         text not null default 'not_connected',
  last_synced_at timestamptz,
  config         jsonb not null default '{}'::jsonb
);
create index if not exists integrations_org_id_idx on public.integrations(org_id);

create table if not exists public.notification_configs (
  id      text primary key,
  org_id  text not null references public.organizations(id) on delete cascade,
  channel text not null,
  status  text not null default 'not_connected',
  target  text,
  enabled boolean not null default false
);
create index if not exists notification_configs_org_id_idx
  on public.notification_configs(org_id);

create table if not exists public.delivery_preferences (
  org_id         text primary key references public.organizations(id) on delete cascade,
  daily_summary  boolean not null default true,
  critical_alerts boolean not null default true,
  weekly_digest  boolean not null default true,
  send_time      text not null default '08:00'
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.metrics               enable row level security;
alter table public.metric_points         enable row level security;
alter table public.reports               enable row level security;
alter table public.insights              enable row level security;
alter table public.recommended_actions   enable row level security;
alter table public.integrations          enable row level security;
alter table public.notification_configs  enable row level security;
alter table public.delivery_preferences  enable row level security;

-- True when the current auth user is a member of the given org.
create or replace function public.is_org_member(target_org_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = target_org_id
      and m.user_id = auth.uid()
  );
$$;

-- Members can read their own memberships.
create policy organization_members_select on public.organization_members
  for select using (user_id = auth.uid());

-- Organizations: members can read their orgs.
create policy organizations_select on public.organizations
  for select using (public.is_org_member(id));

-- Generic org-scoped read policies for every tenant table.
create policy metrics_select on public.metrics
  for select using (public.is_org_member(org_id));
create policy metric_points_select on public.metric_points
  for select using (public.is_org_member(org_id));
create policy reports_select on public.reports
  for select using (public.is_org_member(org_id));
create policy insights_select on public.insights
  for select using (public.is_org_member(org_id));
create policy recommended_actions_select on public.recommended_actions
  for select using (public.is_org_member(org_id));
create policy integrations_select on public.integrations
  for select using (public.is_org_member(org_id));
create policy notification_configs_select on public.notification_configs
  for select using (public.is_org_member(org_id));
create policy delivery_preferences_select on public.delivery_preferences
  for select using (public.is_org_member(org_id));

-- Write policies (insert/update/delete) scoped to org membership.
create policy metrics_write on public.metrics
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy metric_points_write on public.metric_points
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy reports_write on public.reports
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy insights_write on public.insights
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy recommended_actions_write on public.recommended_actions
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy integrations_write on public.integrations
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy notification_configs_write on public.notification_configs
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
create policy delivery_preferences_write on public.delivery_preferences
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
