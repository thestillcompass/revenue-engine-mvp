-- Staging-first AI suggestion usage guard. Apply to production only during a separate approved release.
create table if not exists public.ai_funnel_generation_usage (
 id bigint generated always as identity primary key,
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index if not exists ai_funnel_generation_usage_workspace_time
 on public.ai_funnel_generation_usage(workspace_id,created_at desc);
alter table public.ai_funnel_generation_usage enable row level security;
revoke all on public.ai_funnel_generation_usage from public, anon, authenticated;

create or replace function public.consume_ai_funnel_generation_quota()
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
 v_user uuid := (select auth.uid());
 v_workspace uuid;
 v_now timestamptz := statement_timestamp();
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 select id into v_workspace from public.workspaces where user_id=v_user;
 if v_workspace is null then raise exception 'Workspace not found'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_workspace::text,31));
 if (select count(*) from public.ai_funnel_generation_usage where workspace_id=v_workspace and created_at>v_now-interval '24 hours') >= 10
 or (select count(*) from public.ai_funnel_generation_usage where workspace_id=v_workspace and created_at>v_now-interval '30 days') >= 100 then
  return false;
 end if;
 insert into public.ai_funnel_generation_usage(workspace_id,user_id,created_at) values(v_workspace,v_user,v_now);
 return true;
end;
$$;
revoke all on function public.consume_ai_funnel_generation_quota() from public, anon;
grant execute on function public.consume_ai_funnel_generation_quota() to authenticated;
