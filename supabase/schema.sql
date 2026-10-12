create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Revenue Engine',
  offer text,
  ideal_customer text,
  avg_customer_value numeric not null default 0,
  monthly_leads integer not null default 0,
  lead_source text,
  crm text,
  booking_tool text,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists workspaces_user_unique on public.workspaces(user_id);

create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  scores jsonb not null,
  normalized integer not null,
  priorities jsonb not null,
  primary_leak text not null,
  secondary_leak text,
  recommendation jsonb not null,
  delivery text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cqf_models (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  inputs jsonb not null,
  model jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  config jsonb not null,
  blocks jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  inputs jsonb not null,
  metrics jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.diagnostics enable row level security;
alter table public.cqf_models enable row level security;
alter table public.journeys enable row level security;
alter table public.metric_snapshots enable row level security;

create policy "workspace owner read" on public.workspaces for select using (auth.uid() = user_id);
create policy "workspace owner insert" on public.workspaces for insert with check (auth.uid() = user_id);
create policy "workspace owner update" on public.workspaces for update using (auth.uid() = user_id);
create policy "workspace owner delete" on public.workspaces for delete using (auth.uid() = user_id);

create policy "diagnostic owner read" on public.diagnostics for select using (auth.uid() = user_id);
create policy "diagnostic owner insert" on public.diagnostics for insert with check (auth.uid() = user_id);
create policy "diagnostic owner delete" on public.diagnostics for delete using (auth.uid() = user_id);

create policy "cqf owner read" on public.cqf_models for select using (auth.uid() = user_id);
create policy "cqf owner insert" on public.cqf_models for insert with check (auth.uid() = user_id);
create policy "cqf owner delete" on public.cqf_models for delete using (auth.uid() = user_id);

create policy "journey owner read" on public.journeys for select using (auth.uid() = user_id);
create policy "journey owner insert" on public.journeys for insert with check (auth.uid() = user_id);
create policy "journey owner delete" on public.journeys for delete using (auth.uid() = user_id);

create policy "metrics owner read" on public.metric_snapshots for select using (auth.uid() = user_id);
create policy "metrics owner insert" on public.metric_snapshots for insert with check (auth.uid() = user_id);
create policy "metrics owner delete" on public.metric_snapshots for delete using (auth.uid() = user_id);
