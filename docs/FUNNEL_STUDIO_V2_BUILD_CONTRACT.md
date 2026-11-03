# Revenue Engine — Funnel Studio V2 build contract

Status: planned; not yet implemented. Branch: `feature/v3-owner-workspace`. Production must remain unchanged until independent release approval.

## Customer job
A consultancy or small service-business owner enters their business, audience, offer and conversion objective; receives a useful, editable funnel; publishes it; and receives qualified enquiries in My Leads without technical setup.

## Non-negotiable compatibility
- Reuse the existing authenticated workspace, draft storage, versioned publication, `/f/[slug]` public route and `submit_funnel_enquiry` pipeline.
- Preserve existing published versions and leads. New optional content fields must not invalidate old snapshots.
- Never put AI/provider secrets in client code. AI suggestions remain drafts until reviewed and saved by the owner.
- No unverified claims, fabricated testimonials or invented booking availability.
- Keep Turnstile, server-only Supabase secret, RLS, and edge firewall protections.
- Avoid costly new infrastructure until validated demand warrants it.

## Build sequence / acceptance gates
1. **Funnel design contract and truthful preview:** Align the Studio preview with what the published page really renders, including consent and submission flow. Verify desktop/mobile and existing saved drafts remain intact.
2. **Assisted setup:** Collect sector, target customer, service, intended outcome and desired CTA using clear inputs. Provide deterministic non-AI starter templates; make existing custom text editable.
3. **AI-assisted copy (opt-in):** Add server-only generation with strict schema, size limits and cost controls; store suggestions as owner-reviewable drafts, never auto-publish. Provide graceful fallback to manual editing.
4. **Funnel conversion behavior:** Extend qualification step and lead tags in a backward-compatible way; avoid misleading lead scoring without real data.
5. **Closed-loop measurement:** Track view-to-enquiry and lead disposition with appropriate privacy and consent controls. Add bookings/integrations after evidence of demand.
6. **Validation:** Observe at least five target businesses creating and publishing a usable funnel without developer assistance, collecting actionable UX failure data and willingness-to-pay signals.

## Near-term gates
- Public enquiry error handling: HTTP 429 explains cooldown and preserves entries; HTTP 503 gives a temporary outage message; Turnstile failures retain retry.
- Staging builds, CI and normal visitor form regressions pass.
- No production deployments or database migrations as part of these preparatory changes.

## Not included in initial V2 build
Full ads management, multi-channel inbox, autonomous outreach, invented performance predictions, enterprise analytics, paid integrations, or general-purpose AI chat.
