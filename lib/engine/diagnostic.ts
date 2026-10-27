import { pillars, type PillarCode } from './questions'

export type BusinessProfile = {
  businessName: string
  offer: string
  idealCustomer: string
  avgValue: number
  monthlyLeads: number
  leadSource: string
  crm: string
  bookingTool: string
  offersCount: number
  salesUsers: number
  capability: number
  bookingComplexity: number
}

export type DiagnosticResult = {
  scores: Record<PillarCode, number>
  normalized: number
  priorities: Record<PillarCode, number>
  primaryLeak: PillarCode
  secondaryLeak: PillarCode
  recommendation: {
    readiness: 'Ready' | 'Nearly Ready' | 'Not Yet Ready'
    diagnosis: string
    modules: string[]
    engine: string
    cta: string
    explanation: string
  }
  delivery: 'Self-Service' | 'Assisted Deployment' | 'Done-for-You'
}

const weights: Record<PillarCode, number> = { A:1, C:1.2, Q:1.5, V:1.5, N:1, M:1.1 }

export function analyzeDiagnostic(answers: Record<string, number>, profile: BusinessProfile): DiagnosticResult {
  const scores = Object.fromEntries(pillars.map(p => [p.code, 0])) as Record<PillarCode, number>
  for (const [key, value] of Object.entries(answers)) {
    const code = key[0] as PillarCode
    if (scores[code] !== undefined) scores[code] += Number(value || 0)
  }

  const raw = Object.values(scores).reduce((a,b)=>a+b,0)
  const normalized = Math.round(raw / 120 * 100)
  const priorities = Object.fromEntries(
    pillars.map(p => [p.code, Number(((20 - scores[p.code]) * weights[p.code]).toFixed(2))])
  ) as Record<PillarCode, number>

  const ordered = [...pillars].sort((a,b)=>priorities[b.code]-priorities[a.code])
  const primaryLeak = ordered[0].code
  const secondaryLeak = ordered[1].code

  const recommendation = route(scores, profile)
  const delivery = recommendDelivery(profile)

  return { scores, normalized, priorities, primaryLeak, secondaryLeak, recommendation, delivery }
}

function route(s: Record<PillarCode, number>, p: BusinessProfile): DiagnosticResult['recommendation'] {
  if (!p.offer || !p.idealCustomer || p.avgValue <= 0) {
    return {
      readiness:'Not Yet Ready', diagnosis:'Commercial foundation is unclear', modules:[],
      engine:'Revenue Engine Readiness Blueprint', cta:'Fix My Foundation',
      explanation:'Before automation, the business needs a clearly defined offer, target buyer and commercial value.'
    }
  }
  if (s.A <= 6 || p.monthlyLeads < 5) {
    return {
      readiness:'Nearly Ready', diagnosis:'Insufficient demand', modules:['M1'],
      engine:'Acquisition Foundation', cta:'Improve My Lead Flow',
      explanation:'The downstream funnel cannot be meaningfully optimized until a consistent volume of relevant prospects enters the system.'
    }
  }

  const downstreamHealthy = s.C >= 12 && s.Q >= 12 && s.V >= 12 && s.N >= 12
  if (s.A <= 11 && downstreamHealthy) {
    return {
      readiness:'Ready', diagnosis:'Acquisition is the limiting constraint', modules:['M1'],
      engine:'Acquisition Blueprint', cta:'Strengthen My Lead Flow',
      explanation:'The downstream revenue journey is structurally healthy, but demand entering the system is not yet strong enough to justify deeper conversion optimization.'
    }
  }

  const weak = (x:PillarCode, n=11) => s[x] <= n
  let modules:string[] = []
  let engine = ''
  let diagnosis = ''
  let cta = ''
  let explanation = ''

  if (weak('C',11) && weak('Q',11) && weak('V',11) && weak('N',11)) {
    modules=['M2','M3','M4','M5']; engine='Full Lead-to-Revenue Engine'; diagnosis='Revenue journey fragmentation'; cta='Build My Revenue Engine';
    explanation='Multiple connected stages are weak, so fixing only one point would leave the customer journey structurally fragmented.'
  } else if (weak('C') && weak('Q') && weak('V')) {
    modules=['M2','M3','M4']; engine='Lead-to-Consultation Engine'; diagnosis='Core lead journey breakdown'; cta='Build My Complete Lead Journey';
    explanation='Leads are leaking across capture, qualification and conversion, so these stages should be repaired together.'
  } else if (weak('Q') && weak('V') && weak('N')) {
    modules=['M3','M4','M5']; engine='Lead-to-Sale Lifecycle Engine'; diagnosis='Sales lifecycle breakdown'; cta='Build My Sales Lifecycle';
    explanation='The business is struggling to identify, convert and continue developing valuable prospects.'
  } else if (weak('Q') && weak('V')) {
    modules=['M3','M4']; engine='Qualified Consultation Engine'; diagnosis='Sales-ready lead leakage'; cta='Build My Consultation Engine';
    explanation='The business is generating interest but does not reliably identify and convert the strongest opportunities into attended sales conversations.'
  } else if (weak('C') && weak('Q')) {
    modules=['M2','M3']; engine='Lead Capture & Qualification Engine'; diagnosis='Front-end conversion leakage'; cta='Build My Lead Engine';
    explanation='Demand exists, but leads are being lost or poorly qualified before they become useful sales opportunities.'
  } else if (weak('V') && weak('N')) {
    modules=['M4','M5']; engine='Conversion & Nurture Engine'; diagnosis='Follow-up and lifecycle leakage'; cta='Improve My Follow-Up System';
    explanation='Good prospects are not consistently moving into booked conversations or being developed when they are not ready immediately.'
  } else if (s.C <= 11 && s.Q >= 12) {
    modules=['M2']; engine='Lead Capture Engine'; diagnosis='Capture leakage'; cta='Stop Losing Enquiries';
    explanation='Demand exists but enquiries are not being captured, responded to or preserved reliably.'
  } else if (s.Q <= 11 && s.C >= 12) {
    modules=['M3']; engine='CQF Qualification Engine'; diagnosis='Poor qualification'; cta='Build My Qualification System';
    explanation='The business cannot consistently distinguish high-value opportunities from poor-fit enquiries.'
  } else if (s.V <= 11 && s.Q >= 12) {
    modules=['M4']; engine='Booking & Conversion Engine'; diagnosis='Booking and conversion leakage'; cta='Improve My Booking Conversion';
    explanation='Qualified prospects exist, but too few are progressing into attended sales conversations.'
  } else if (s.N <= 11 && s.Q >= 12 && s.V >= 12) {
    modules=['M5']; engine='Lead Nurture Engine'; diagnosis='Nurture leakage'; cta='Recover My Dormant Leads';
    explanation='The immediate funnel works, but valuable prospects disappear when they are not ready to buy now.'
  } else if (s.M <= 11) {
    modules=['M6']; engine='Revenue Intelligence Setup'; diagnosis='Attribution blind spot'; cta='See What Actually Converts';
    explanation='The business has activity but cannot reliably connect marketing and funnel behavior to commercial outcomes.'
  } else {
    modules=['M7']; engine='Revenue Optimization Intelligence'; diagnosis='Structured engine ready for optimization'; cta='Optimize My Revenue Engine';
    explanation='The core journey is reasonably healthy. The next value lies in ongoing measurement, experimentation and optimization.'
  }

  if (s.M <= 11 && modules.length && !modules.includes('M6') && !modules.includes('M7')) modules.push('M6')
  return { readiness:'Ready', diagnosis, modules, engine, cta, explanation }
}

function recommendDelivery(p: BusinessProfile): DiagnosticResult['delivery'] {
  const complexity = p.offersCount + p.salesUsers + p.bookingComplexity +
    (p.crm === 'Other / Custom' ? 2 : p.crm === 'No CRM' ? 1 : 0) +
    (p.leadSource === 'Other' ? 1 : 0)
  const capability = p.capability
  if (complexity >= 7 || (complexity >= 5 && capability === 0)) return 'Done-for-You'
  if (complexity >= 4 || capability === 0) return 'Assisted Deployment'
  return 'Self-Service'
}
