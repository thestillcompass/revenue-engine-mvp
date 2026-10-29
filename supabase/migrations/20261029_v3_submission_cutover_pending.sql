-- ACTIVATION ONLY: apply after staging Turnstile + server secret keys are configured and tested.
revoke execute on function public.submit_funnel_enquiry(text,text,text,text,boolean,text) from anon,authenticated,public;
grant execute on function public.submit_funnel_enquiry(text,text,text,text,boolean,text) to service_role;
