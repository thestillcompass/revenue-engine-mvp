-- PUBLIC entry point: tightly scoped, validated and transactional. Never expose table INSERT.
create or replace function public.submit_funnel_enquiry(p_slug text,p_name text,p_email text,p_answer text,p_consent boolean,p_website text default '')
returns boolean language plpgsql security definer set search_path = ''
as $$
declare target record; normalized_email text; last_match timestamptz; recent_count integer;
begin
 if p_website is null or length(p_website)>0 then return false; end if;
 if p_consent is distinct from true then return false; end if;
 if p_slug !~ '^[a-f0-9]{32}$' then return false; end if;
 if p_name is null or length(btrim(p_name)) not between 1 and 120 then return false; end if;
 if p_email is null or length(p_email)>254 then return false; end if;
 normalized_email:=lower(btrim(p_email));
 if normalized_email !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then return false; end if;
 if p_answer is null or length(btrim(p_answer)) not between 1 and 1500 then return false; end if;
 select f.id as funnel_id,f.workspace_id,f.user_id,f.published_version_id as version_id into target
 from public.funnels f where f.slug=p_slug and f.status='published' and f.published_version_id is not null;
 if not found then return false; end if;
 -- Serialise requests per funnel; keeps count and duplicate checks coherent.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target.funnel_id::text,0));
 select count(*) into recent_count from public.funnel_leads
 where funnel_id=target.funnel_id and created_at > now()-interval '1 hour';
 if recent_count >= 100 then return false; end if;
 select max(created_at) into last_match from public.funnel_leads
 where funnel_id=target.funnel_id and lower(visitor_email)=normalized_email;
 if last_match is not null and last_match>now()-interval '15 minutes' then return true; end if;
 insert into public.funnel_leads(funnel_id,version_id,workspace_id,user_id,visitor_name,visitor_email,answer,contact_consent)
 values(target.funnel_id,target.version_id,target.workspace_id,target.user_id,btrim(p_name),normalized_email,btrim(p_answer),true);
 return true;
end;$$;
revoke all on function public.submit_funnel_enquiry(text,text,text,text,boolean,text) from public;
grant execute on function public.submit_funnel_enquiry(text,text,text,text,boolean,text) to anon,authenticated;
