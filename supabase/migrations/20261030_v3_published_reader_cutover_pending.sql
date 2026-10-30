-- Apply to V3 staging after the server-only reader deployment is READY and smoke-tested.
revoke execute on function public.get_published_funnel(text) from anon, authenticated, public;
grant execute on function public.get_published_funnel(text) to service_role;
