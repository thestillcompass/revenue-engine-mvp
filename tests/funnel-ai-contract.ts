import { strict as assert } from 'node:assert'
import {
  AI_FUNNEL_GENERATION_POLICY,
  AI_MAX_OUTPUT_TOKENS,
  parseGeneratedFunnel,
  parseGenerationBrief,
} from '../lib/funnel-ai-contract'

const brief = parseGenerationBrief({
  business: 'Example Strategy Consulting',
  sector: 'consulting',
  objective: 'consultation',
  audience: 'Founder-led SMEs',
  service: 'Business strategy consulting',
  desiredOutcome: 'Improve operational performance',
})
assert.ok(brief, 'valid brief is accepted')
assert.equal(brief.audience, 'Founder-led SMEs')
assert.equal(parseGenerationBrief({ ...brief, business: '   ' }), null)
assert.equal(parseGenerationBrief({ ...brief, service: 'X'.repeat(91) }), null)
assert.equal(parseGenerationBrief({ ...brief, sector: 'unknown' }), null)
assert.equal(parseGenerationBrief({ ...brief, service: 'hello\u0000world' }), null)

const output = {
  name: 'Strategy consultation enquiry',
  business: brief.business,
  headline: 'Improve how your business operates.',
  description: 'Tell us about your operational priorities and we can explore whether our services fit.',
  cta: 'Request a Consultation',
  question: 'What business issue would you most like to resolve?',
}
assert.deepEqual(parseGeneratedFunnel(output, brief), output)
assert.equal(parseGeneratedFunnel({ ...output, headline: 'X'.repeat(141) }, brief), null)
assert.equal(parseGeneratedFunnel({ ...output, cta: 'Book your guaranteed appointment' }, brief), null)
assert.equal(parseGeneratedFunnel({ ...output, business: 'Other business' }, brief), null)
assert.equal(parseGeneratedFunnel({ ...output, question: '' }, brief), null)
assert.equal(parseGeneratedFunnel({ ...output, description: { text: 'unsafe' } }, brief), null)
assert.ok(AI_FUNNEL_GENERATION_POLICY.some(line=>line.includes('testimonials')))
assert.ok(AI_MAX_OUTPUT_TOKENS <= 500)
console.log('AI funnel generation contract checks passed')
