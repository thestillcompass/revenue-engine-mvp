-- Limit reservation to the trusted application server, never a browser-authenticated RPC.
drop function if exists public.consume_ai_funnel_generation_quota();
create or replace function public.consume_ai_funnel_generation_quota(p_user uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
 v_workspace uuid;
 v_now timestamptz := statement_timestamp();
begin
 if p_user is null then raise exception 'User required'; end if;
 select id into v_workspace from public.workspaces where user_id=p_user;
 if v_workspace is null then raise exception 'Workspace not found'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_workspace::text,31));
 if (select count(*) from public.ai_funnel_generation_usage where workspace_id=v_workspace and created_at>v_now-interval '24 hours') >= 10
 or (select count(*) from public.ai_funnel_generation_usage where workspace_id=v_workspace and created_at>v_now-interval '30 days') >= 100 then
  return false;
 end if;
 insert into public.ai_funnel_generation_usage(workspace_id,user_id,created_at) values(v_workspace,p_user,v_now);
 return true;
end;
$$;
revoke all on function public.consume_ai_funnel_generation_quota(uuid) from public, anon, authenticated;
grant execute on function public.consume_ai_funnel_generation_quota(uuid) to service_role;
