-- V3 lead foundation: owner-only access; NO anonymous writes or public submission RPC.
create table public.funnel_leads (
 id uuid primary key default gen_random_uuid(),
 funnel_id uuid not null references public.funnels(id) on delete cascade,
 version_id uuid not null references public.funnel_versions(id),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 visitor_name text not null check (char_length(visitor_name) between 1 and 120),
 visitor_email text not null check (char_length(visitor_email) between 3 and 254),
 answer text not null check (char_length(answer) between 1 and 1500),
 contact_consent boolean not null check (contact_consent = true),
 status text not null default 'new' check (status in ('new','contacted','closed')),
 created_at timestamptz not null default now(),
 foreign key (funnel_id,workspace_id) references public.funnels(id,workspace_id)
);
create index funnel_leads_workspace_created on public.funnel_leads(workspace_id,created_at desc);
alter table public.funnel_leads enable row level security;
create policy funnel_leads_owner_read on public.funnel_leads for select to authenticated using (
 user_id=(select auth.uid()) and exists (
 select 1 from public.funnels f where f.id=funnel_id and f.workspace_id=workspace_id and f.user_id=(select auth.uid())
 )
);
create policy funnel_leads_owner_update on public.funnel_leads for update to authenticated using (
 user_id=(select auth.uid()) and exists (
 select 1 from public.funnels f where f.id=funnel_id and f.workspace_id=workspace_id and f.user_id=(select auth.uid())
 )
) with check (
 user_id=(select auth.uid()) and exists (
 select 1 from public.funnels f where f.id=funnel_id and f.workspace_id=workspace_id and f.user_id=(select auth.uid())
 )
);
revoke all on public.funnel_leads from anon,authenticated;
grant select on public.funnel_leads to authenticated;
grant update(status) on public.funnel_leads to authenticated;
-- No INSERT grants to visitor or user roles until reviewed anti-abuse service endpoint.
