-- V3 publishing foundation: owner-private until public renderer and release gates exist.
-- Each funnel has a mutable publication pointer; versions are immutable.
create table public.funnels (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 slug text not null unique default replace(gen_random_uuid()::text,'-',''),
 status text not null default 'draft' check(status in ('draft','published')),
 published_version_id uuid,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,workspace_id)
);
create table public.funnel_versions (
 id uuid primary key default gen_random_uuid(),
 funnel_id uuid not null,
 workspace_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 version_number integer not null check(version_number > 0),
 content jsonb not null check(jsonb_typeof(content) = 'object'),
 created_at timestamptz not null default now(),
 unique(funnel_id,version_number),
 unique(funnel_id,id),
 foreign key(funnel_id,workspace_id) references public.funnels(id,workspace_id) on delete cascade
);
alter table public.funnels add constraint funnels_published_version_same_funnel
 foreign key(id,published_version_id) references public.funnel_versions(funnel_id,id);
alter table public.funnels add constraint funnels_published_requires_version
 check(status <> 'published' or published_version_id is not null);
create index funnel_versions_funnel_created_idx on public.funnel_versions(funnel_id,created_at desc);
alter table public.funnels enable row level security;
alter table public.funnel_versions enable row level security;
create policy funnels_owner_read on public.funnels for select to authenticated using (
 user_id=(select auth.uid()) and exists(select 1 from public.workspaces w where w.id=workspace_id and w.user_id=(select auth.uid()))
);
create policy funnels_owner_insert on public.funnels for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.workspaces w where w.id=workspace_id and w.user_id=(select auth.uid()))
);
create policy funnels_owner_update on public.funnels for update to authenticated using (
 user_id=(select auth.uid()) and exists(select 1 from public.workspaces w where w.id=workspace_id and w.user_id=(select auth.uid()))
) with check (
 user_id=(select auth.uid()) and exists(select 1 from public.workspaces w where w.id=workspace_id and w.user_id=(select auth.uid()))
);
create policy versions_owner_read on public.funnel_versions for select to authenticated using (
 user_id=(select auth.uid()) and exists(select 1 from public.funnels f where f.id=funnel_id and f.workspace_id=workspace_id and f.user_id=(select auth.uid()))
);
create policy versions_owner_insert on public.funnel_versions for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.funnels f where f.id=funnel_id and f.workspace_id=workspace_id and f.user_id=(select auth.uid()))
);
revoke all on public.funnels from anon,authenticated;
revoke all on public.funnel_versions from anon,authenticated;
grant select,insert,update on public.funnels to authenticated;
grant select,insert on public.funnel_versions to authenticated;
-- Deliberately no public SELECT policy and no anonymous privileges yet.
