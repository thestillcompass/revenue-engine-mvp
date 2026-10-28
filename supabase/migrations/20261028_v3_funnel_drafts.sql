-- V3 draft storage. Review and test before applying to any hosted database.
create table if not exists public.funnel_drafts (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 draft jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint funnel_drafts_one_per_workspace unique(workspace_id),
 constraint funnel_drafts_object check (jsonb_typeof(draft) = 'object')
);
alter table public.funnel_drafts enable row level security;
create policy "funnel_drafts_owner_select" on public.funnel_drafts for select to authenticated
 using (user_id = (select auth.uid()) and exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = (select auth.uid())));
create policy "funnel_drafts_owner_insert" on public.funnel_drafts for insert to authenticated
 with check (user_id = (select auth.uid()) and exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = (select auth.uid())));
create policy "funnel_drafts_owner_update" on public.funnel_drafts for update to authenticated
 using (user_id = (select auth.uid()) and exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = (select auth.uid())))
 with check (user_id = (select auth.uid()) and exists (select 1 from public.workspaces w where w.id = workspace_id and w.user_id = (select auth.uid())));
revoke all on public.funnel_drafts from anon, authenticated;
grant select, insert, update on public.funnel_drafts to authenticated;
