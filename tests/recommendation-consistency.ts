import assert from 'node:assert/strict'
import { analyzeDiagnostic, type BusinessProfile } from '../lib/engine/diagnostic'
import { generateCqf } from '../lib/engine/cqf'

const profile: BusinessProfile = {
  businessName:'Test Co',
  offer:'High-value advisory service',
  idealCustomer:'Founder-led B2B services firm',
  avgValue:100000,
  monthlyLeads:25,
  leadSource:'Instagram / Meta',
  crm:'Zoho CRM',
  bookingTool:'Calendly',
  offersCount:0,
  salesUsers:0,
  capability:1,
  bookingComplexity:0
}

function answersFromScores(scores: Record<'A'|'C'|'Q'|'V'|'N'|'M',number>){
  const answers:Record<string,number>={}
  for(const [pillar,total] of Object.entries(scores)){
    let remaining=total
    for(let i=1;i<=5;i++){
      const slots=6-i
      const min=Math.max(0,remaining-4*(slots-1))
      const value=Math.min(4,Math.max(min,Math.ceil(remaining/slots)))
      answers[`${pillar}${i}`]=value
      remaining-=value
    }
  }
  return answers
}

const cases=[
  {name:'critical acquisition',scores:{A:5,C:16,Q:16,V:16,N:16,M:16},modules:['M1'],engine:'Acquisition Foundation'},
  {name:'weak acquisition with healthy downstream',scores:{A:10,C:14,Q:14,V:14,N:14,M:14},modules:['M1'],engine:'Acquisition Blueprint'},
  {name:'capture only',scores:{A:14,C:8,Q:14,V:14,N:14,M:14},modules:['M2'],engine:'Lead Capture Engine'},
  {name:'qualification only',scores:{A:14,C:14,Q:8,V:14,N:14,M:14},modules:['M3'],engine:'CQF Qualification Engine'},
  {name:'conversion only',scores:{A:14,C:14,Q:14,V:8,N:14,M:14},modules:['M4'],engine:'Booking & Conversion Engine'},
  {name:'nurture only',scores:{A:14,C:14,Q:14,V:14,N:8,M:14},modules:['M5'],engine:'Lead Nurture Engine'},
  {name:'measurement only',scores:{A:14,C:14,Q:14,V:14,N:14,M:7},modules:['M6'],engine:'Revenue Intelligence Setup'},
  {name:'capture plus qualification',scores:{A:14,C:8,Q:8,V:14,N:14,M:14},modules:['M2','M3'],engine:'Lead Capture & Qualification Engine'},
  {name:'qualification plus conversion',scores:{A:14,C:14,Q:8,V:8,N:14,M:14},modules:['M3','M4'],engine:'Qualified Consultation Engine'},
  {name:'human plausibility boundary',scores:{A:9,C:15,Q:10,V:11,N:12,M:12},modules:['M3','M4'],engine:'Qualified Consultation Engine'},
  {name:'conversion plus nurture',scores:{A:14,C:14,Q:14,V:8,N:8,M:14},modules:['M4','M5'],engine:'Conversion & Nurture Engine'},
  {name:'capture qualification conversion',scores:{A:14,C:8,Q:8,V:8,N:14,M:14},modules:['M2','M3','M4'],engine:'Lead-to-Consultation Engine'},
  {name:'qualification conversion nurture',scores:{A:14,C:14,Q:8,V:8,N:8,M:14},modules:['M3','M4','M5'],engine:'Lead-to-Sale Lifecycle Engine'},
  {name:'full downstream fragmentation',scores:{A:14,C:10,Q:10,V:10,N:10,M:14},modules:['M2','M3','M4','M5'],engine:'Full Lead-to-Revenue Engine'},
  {name:'measurement overlay',scores:{A:14,C:14,Q:8,V:8,N:14,M:8},modules:['M3','M4','M6'],engine:'Qualified Consultation Engine'},
  {name:'healthy engine',scores:{A:16,C:16,Q:16,V:16,N:16,M:16},modules:['M7'],engine:'Revenue Optimization Intelligence'}
] as const

for(const tc of cases){
  const result=analyzeDiagnostic(answersFromScores(tc.scores),profile)
  assert.deepEqual(result.recommendation.modules,tc.modules,`${tc.name}: wrong modules`)
  assert.equal(result.recommendation.engine,tc.engine,`${tc.name}: wrong engine`)
}

const lowVolume=analyzeDiagnostic(answersFromScores({A:16,C:16,Q:16,V:16,N:16,M:16}),{...profile,monthlyLeads:3})
assert.deepEqual(lowVolume.recommendation.modules,['M1'])
assert.equal(lowVolume.recommendation.readiness,'Nearly Ready')

const assisted=analyzeDiagnostic(answersFromScores({A:14,C:14,Q:8,V:8,N:14,M:14}),{...profile,offersCount:2,salesUsers:1,bookingComplexity:1})
assert.equal(assisted.delivery,'Assisted Deployment')

const dfy=analyzeDiagnostic(answersFromScores({A:14,C:14,Q:8,V:8,N:14,M:14}),{...profile,offersCount:2,salesUsers:2,bookingComplexity:2,crm:'Other / Custom'})
assert.equal(dfy.delivery,'Done-for-You')

const cqf=generateCqf({fit:'20+ employees',need:'Founder Dependency',value:'5Cr+ turnover',authority:'Founder',timing:'30',disqualifiers:'Direct Consumers'})
assert.equal(cqf.maxScore,40)
assert.equal(cqf.questions.reduce((sum,q)=>sum+q.max,0),40)
assert.ok(cqf.questions.every(q=>q.scoring.length>=4),'Every CQF dimension must expose a scoring rubric')
assert.deepEqual(cqf.routingOrder,['Exit','Sales Ready','Nurture','Potential Fit'])
assert.ok(cqf.routing.every(r=>r.action && r.rule),'Every CQF route must explain both rule and action')

console.log(`Recommendation consistency: ${cases.length+4} scenarios passed`)
