# Revenue Engine — Hosted MVP V0.1

This is the first deployable hosted version of the Revenue Engine product brain.

## What is implemented

- Public landing page
- Public 3-minute Revenue Leak Diagnostic
- Supabase email/password authentication
- Protected user workspace
- 30-question Lead-to-Revenue Diagnostic
- Server-side scoring and routing engine
- Persistent diagnostic history in Postgres
- CQF Qualification Engine
- Journey Generation Engine
- Revenue Intelligence calculator and snapshots
- Row Level Security so users can access only their own workspace data

## Stack

- Next.js App Router
- React + TypeScript
- Supabase Auth + Postgres + Row Level Security
- Vercel-ready deployment

The product architecture intentionally keeps ManyChat, Meta, Zoho, HubSpot and other systems as future adapters rather than making one vendor the product core.

## 1. Create a Supabase project

Create a Supabase project, then open the SQL Editor and run:

`supabase/schema.sql`

## 2. Configure authentication

In Supabase Auth, enable Email/Password.

For confirmation emails, use the server-side confirmation URL pattern described by Supabase and set your Site URL to the deployed domain. For local development use `http://localhost:3000`.

## 3. Environment variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Local development

```
npm install
npm run dev
```

Open `http://localhost:3000`.

## 5. Deploy on Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Add the Supabase environment variables in Vercel.
4. Deploy.
5. Update Supabase Auth Site URL / redirect URLs to the Vercel production domain.

## MVP validation target

Do not add payment, AI, Meta, ManyChat, CRM or ad integrations yet unless the hosted product brain survives pilot use.

Validate:

- Diagnostic completion rate
- Recommendation quality
- % users progressing from diagnosis to CQF
- % generating a journey
- Support required per user
- Whether buyers understand and value the recommendation
- Whether recurring Revenue Intelligence is desirable after live data exists

## Next build milestones

1. Billing and plan entitlements
2. Saved multi-workspace support
3. Blueprint export
4. ManyChat integration adapter
5. Zoho / HubSpot adapters
6. Meta CAPI event adapter
7. AI-assisted CQF question generation and result explanations
8. Recurring Revenue Optimization Intelligence
