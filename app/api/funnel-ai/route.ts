import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  AI_FUNNEL_GENERATION_POLICY,
  AI_MAX_OUTPUT_TOKENS,
  AI_REQUEST_TIMEOUT_MS,
  funnelLimits,
  parseGeneratedFunnel,
  parseGenerationBrief,
} from '@/lib/funnel-ai-contract'

export const runtime = 'nodejs'
const noStore = { 'Cache-Control': 'no-store' }

export async function GET() {
  const db = await createClient()
  const { data: { user }, error } = await db.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  return NextResponse.json({ enabled: Boolean(process.env.OPENAI_API_KEY) }, { headers: noStore })
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403, headers: noStore })
  }
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 415, headers: noStore })
  }
  const length = Number(req.headers.get('content-length') || 0)
  if (length > 4096) return NextResponse.json({ error: 'Brief is too large' }, { status: 413, headers: noStore })
  const db = await createClient()
  const { data: { user }, error: authError } = await db.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore })
  if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'AI generation is not configured for this staging workspace. Use the guided example instead.' }, { status: 503, headers: noStore })
  }
  const text = await req.text()
  if (Buffer.byteLength(text, 'utf8') > 4096) return NextResponse.json({ error: 'Brief is too large' }, { status: 413, headers: noStore })
  let json: unknown
  try { json = JSON.parse(text) } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: noStore })
  }
  const brief = parseGenerationBrief(json)
  if (!brief) return NextResponse.json({ error: 'Complete the business, audience, service and desired outcome fields.' }, { status: 400, headers: noStore })

  // Single transactional quota reservation before provider spend; fail closed if quota storage fails.
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: allowed, error: quotaError } = await admin.rpc('consume_ai_funnel_generation_quota', { p_user: user.id })
  if (quotaError) {
    console.error('AI quota reservation failed:', quotaError.code)
    return NextResponse.json({ error: 'AI generation is temporarily unavailable.' }, { status: 503, headers: noStore })
  }
  if (allowed !== true) {
    return NextResponse.json({ error: 'AI generation allowance reached (10 attempts per 24 hours or 100 per 30 days). Please use the manual editor.' }, { status: 429, headers: noStore })
  }

  const fields = Object.keys(funnelLimits)
  const schema = {
    type: 'object',
    properties: Object.fromEntries(fields.map(key => [key, { type: 'string' }])),
    required: fields,
    additionalProperties: false,
  }
  const cta = brief.objective === 'consultation' ? 'Request a Consultation' : 'Send an Enquiry'
  try {
    const result = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        store: false,
        max_output_tokens: AI_MAX_OUTPUT_TOKENS,
        instructions: AI_FUNNEL_GENERATION_POLICY.join('\n'),
        input: JSON.stringify({ ...brief, requiredCta: cta }),
        text: { format: { type: 'json_schema', name: 'funnel_copy', strict: true, schema } },
      }),
    })
    if (!result.ok) {
      console.error('Funnel AI provider status:', result.status)
      return NextResponse.json({ error: 'AI could not generate a suggestion. Your existing draft is safe.' }, { status: 502, headers: noStore })
    }
    const response = await result.json() as {
      status?: string,
      output?: Array<{ type?: string, content?: Array<{ type?: string, text?: string, refusal?: string }> }>,
    }
    if (response.status !== 'completed') throw new Error('Incomplete model response')
    const parts = response.output?.flatMap(item => item.type === 'message' ? item.content ?? [] : []) ?? []
    const raw = parts.find(part => part.type === 'output_text')?.text
    if (!raw || parts.some(part => part.type === 'refusal')) throw new Error('Model response missing or refused')
    const suggestion = parseGeneratedFunnel(JSON.parse(raw) as unknown, brief)
    if (!suggestion) throw new Error('Model output failed validation')
    return NextResponse.json({ suggestion, notice: 'AI copy is a draft. Check every claim before applying it.' }, { headers: noStore })
  } catch (error) {
    console.error('Funnel AI suggestion unavailable:', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json({ error: 'AI could not produce a valid suggestion. Your existing draft is unchanged.' }, { status: 502, headers: noStore })
  }
}
