-- Staging publishing hardening: one consultation funnel per workspace in V3 pilot.
create unique index if not exists funnels_workspace_unique on public.funnels(workspace_id);
-- Public exposes only published content, never tenant IDs or drafts.
create or replace function public.get_published_funnel(requested_slug text)
returns table(slug text, content jsonb)
language sql stable security definer
set search_path = ''
as $$
 select f.slug,v.content from public.funnels f
 join public.funnel_versions v on v.id=f.published_version_id and v.funnel_id=f.id
 where f.slug=requested_slug and f.status='published'
 limit 1
$$;
revoke all on function public.get_published_funnel(text) from public;
grant execute on function public.get_published_funnel(text) to anon,authenticated;
