-- Publication changes are atomic and serialized per workspace.
create or replace function public.publish_saved_funnel()
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare uid uuid; ws uuid; f record; snap jsonb; version_id uuid; next_version integer;
begin
 uid:=auth.uid();
 if uid is null then raise exception 'Authentication required'; end if;
 select w.id into ws from public.workspaces w where w.user_id=uid;
 if ws is null then raise exception 'Workspace not found'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(ws::text,14));
 select d.draft into snap from public.funnel_drafts d where d.workspace_id=ws and d.user_id=uid;
 if snap is null or jsonb_typeof(snap)<>'object' then raise exception 'Save a draft first'; end if;
 if not (
 jsonb_typeof(snap->'name')='string' and length(snap->>'name') between 1 and 80 and
 jsonb_typeof(snap->'business')='string' and length(snap->>'business') between 1 and 80 and
 jsonb_typeof(snap->'headline')='string' and length(snap->>'headline') between 1 and 140 and
 jsonb_typeof(snap->'description')='string' and length(snap->>'description')<=280 and
 jsonb_typeof(snap->'cta')='string' and length(snap->>'cta') between 1 and 45 and
 jsonb_typeof(snap->'question')='string' and length(snap->>'question') between 1 and 160
 ) then raise exception 'Invalid draft'; end if;
 insert into public.funnels(workspace_id,user_id) values(ws,uid) on conflict (workspace_id) do nothing;
 select id,slug into f from public.funnels where workspace_id=ws and user_id=uid for update;
 if not found then raise exception 'Not authorized'; end if;
 select coalesce(max(v.version_number),0)+1 into next_version from public.funnel_versions v where v.funnel_id=f.id;
 insert into public.funnel_versions(funnel_id,workspace_id,user_id,version_number,content)
 values(f.id,ws,uid,next_version,snap) returning id into version_id;
 update public.funnels set status='published',published_version_id=version_id,updated_at=now() where id=f.id and user_id=uid;
 return pg_catalog.jsonb_build_object('published',true,'slug',f.slug,'version',next_version);
end;$$;
create or replace function public.unpublish_saved_funnel()
returns boolean language plpgsql security invoker set search_path = ''
as $$
declare uid uuid; ws uuid;
begin
 uid:=auth.uid(); if uid is null then raise exception 'Authentication required'; end if;
 select w.id into ws from public.workspaces w where w.user_id=uid;
 if ws is null then raise exception 'Workspace not found'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(ws::text,14));
 update public.funnels set status='draft',updated_at=now() where workspace_id=ws and user_id=uid;
 return true;
end;$$;
revoke all on function public.publish_saved_funnel() from public,anon;
revoke all on function public.unpublish_saved_funnel() from public,anon;
grant execute on function public.publish_saved_funnel() to authenticated;
grant execute on function public.unpublish_saved_funnel() to authenticated;
