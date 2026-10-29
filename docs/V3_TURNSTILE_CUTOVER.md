# V3 Turnstile cutover (NOT ACTIVE)
1. Create Cloudflare Turnstile widget for staging preview hostname.
2. Configure these Vercel preview branch-specific values:
NEXT_PUBLIC_TURNSTILE_SITE_KEY = public widget key
TURNSTILE_SECRET_KEY = private widget secret
TURNSTILE_EXPECTED_HOSTNAME = exact staging hostname, without https
SUPABASE_SECRET_KEY = staging Supabase secret key, server-only
Never paste secrets into ChatGPT or GitHub.
3. Redeploy preview and verify successful challenge, rejected missing token, expired token and replay.
4. Apply migration 20261029_v3_submission_cutover_pending.sql ONLY to staging, removing anonymous direct RPC access.
5. Verify unauthenticated direct Supabase RPC is forbidden while legitimate visitor submission through Next.js still reaches My Leads.
IMPORTANT: Prior to step 4 the public RPC bypass remains accessible. Do not claim Turnstile security is active.
Rollback (staging pilot only) would regrant function EXECUTE to anon and reopens bypass. Not suitable for production.
Outstanding: public read function elevated access review, leaked password protection, IP-based rate controls and load tests.
