-- Strengthen tenant isolation by requiring child rows to belong to a workspace
-- owned by the authenticated user, in addition to matching user_id.

drop policy if exists "diagnostic owner read" on public.diagnostics;
drop policy if exists "diagnostic owner insert" on public.diagnostics;
drop policy if exists "diagnostic owner delete" on public.diagnostics;

create policy "diagnostic owner read" on public.diagnostics
for select using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "diagnostic owner insert" on public.diagnostics
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "diagnostic owner delete" on public.diagnostics
for delete using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists "cqf owner read" on public.cqf_models;
drop policy if exists "cqf owner insert" on public.cqf_models;
drop policy if exists "cqf owner delete" on public.cqf_models;

create policy "cqf owner read" on public.cqf_models
for select using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "cqf owner insert" on public.cqf_models
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "cqf owner delete" on public.cqf_models
for delete using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists "journey owner read" on public.journeys;
drop policy if exists "journey owner insert" on public.journeys;
drop policy if exists "journey owner delete" on public.journeys;

create policy "journey owner read" on public.journeys
for select using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "journey owner insert" on public.journeys
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "journey owner delete" on public.journeys
for delete using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

drop policy if exists "metrics owner read" on public.metric_snapshots;
drop policy if exists "metrics owner insert" on public.metric_snapshots;
drop policy if exists "metrics owner delete" on public.metric_snapshots;

create policy "metrics owner read" on public.metric_snapshots
for select using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "metrics owner insert" on public.metric_snapshots
for insert with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);

create policy "metrics owner delete" on public.metric_snapshots
for delete using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and w.user_id = (select auth.uid())
  )
);
