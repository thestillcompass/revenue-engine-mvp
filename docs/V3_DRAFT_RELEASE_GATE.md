# Revenue Engine V3 — Draft persistence release gate

Status: **Not activated**. This is a test plan, not a record of tests passed.

## Current implementation
- Private /app/funnel-studio preview (authenticated via existing /app layout)
- GET/PUT /api/funnel-draft (requires authenticated Supabase user)
- Proposed public.funnel_drafts table with one draft per owner workspace
- No publication route or public lead-capture endpoint
- Migration committed but NOT applied to live project

## Required staging verification
1. Use a separate Supabase development project; configure preview-only credentials.
2. Apply and review 20261028_v3_funnel_drafts.sql there; confirm grants, uniqueness, FKs, and RLS.
3. Anonymous GET and PUT must return 401.
4. Owner A saves, refreshes, signs out and signs back in; draft must load.
5. Owner B must not SELECT, INSERT, UPDATE or overwrite owner A's draft even by supplying A's workspace ID via direct Supabase queries.
6. PUT with missing fields, excessively long strings, invalid JSON, and payload >4096 bytes must fail without changes.
7. Save failures must be disclosed to user; page must not claim persistence.
8. Check old modules: Diagnostic, Qualification, Journey, Intelligence; run consistency tests and full build.
9. Test responsive editor at narrow/mobile widths and keyboard focus.
10. Run Supabase security advisors and check actual table policies after applying migration.
11. Decide whether one draft per workspace is still enough before multi-funnel use; do NOT extend to multi-funnel without an ID-based schema.

## Activation requirements
- Build CI green
- Staging RLS / negative tests green
- Browser smoke test green
- Reviewer approves migration, deployment target, and rollback plan
- Production remains unchanged until explicitly selected for rollout

## Known limitations
- Draft has manual save only; changes may be lost when navigating away.
- No optimistic concurrency for multiple tabs; last save wins.
- No public publishing, lead capture, AI generation, or email automation yet.
- Current workspace helper is single-owner; team membership is out of scope.
