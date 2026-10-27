export type CqfInput = {
  fit: string
  need: string
  value: string
  authority: string
  timing: '30' | '90' | '180'
  disqualifiers: string
}

export function generateCqf(input:CqfInput) {
  const needs = input.need.split(',').map(x=>x.trim()).filter(Boolean)
  const authorities = input.authority.split(',').map(x=>x.trim()).filter(Boolean)
  const questions = [
    {
      dimension:'Fit', max:10,
      prompt:`How closely does this prospect match: ${input.fit || 'our ideal customer profile'}?`,
      type:'single-select',
      scoring:[
        {label:'Strong match to the ideal customer profile',score:10},
        {label:'Mostly matches the ideal customer profile',score:7},
        {label:'Partial match',score:4},
        {label:'Poor fit',score:0}
      ]
    },
    {
      dimension:'Need', max:10,
      prompt:`How strongly does this prospect experience the problem we solve${needs.length ? ` (${needs.slice(0,3).join(', ')})` : ''}?`,
      type:'single-select',
      scoring:[
        {label:'Serious, active problem with clear consequences',score:10},
        {label:'Clear problem, but moderate urgency',score:7},
        {label:'Mild or uncertain problem',score:4},
        {label:'No meaningful problem identified',score:0}
      ]
    },
    {
      dimension:'Value', max:10,
      prompt:`How well does the prospect meet the commercial threshold: ${input.value || 'your business size / engagement value'}?`,
      type:'range',
      scoring:[
        {label:'Meets or exceeds the commercial threshold',score:10},
        {label:'Slightly below the threshold but commercially viable',score:7},
        {label:'Materially below the preferred threshold',score:4},
        {label:'Outside the viable commercial range',score:0}
      ]
    },
    {
      dimension:'Authority', max:5,
      prompt:`What level of buying authority does this person have${authorities.length ? ` (${authorities.slice(0,3).join(', ')})` : ''}?`,
      type:'single-select',
      scoring:[
        {label:'Final decision maker',score:5},
        {label:'Strong decision influencer',score:3},
        {label:'Evaluator / recommender only',score:2},
        {label:'No meaningful buying authority',score:0}
      ]
    },
    {
      dimension:'Timing', max:5,
      prompt:'When is the prospect realistically looking to address this?',
      type:'timeline',
      scoring:[
        {label:'Within 30 days',score:5},
        {label:'Within 90 days',score:4},
        {label:'Within 6 months',score:2},
        {label:'Later / unclear',score:0}
      ]
    }
  ]
  return {
    framework:'FNVAT', maxScore:40,
    explanation:'FNVAT scores Fit, Need, Value, Authority and Timing so each lead can be routed consistently instead of relying on sales intuition.',
    questions,
    thresholds:{ salesReady:30, potential:20 },
    minimums:{ fit:7, need:7, authority:3, timing:3 },
    disqualifiers:input.disqualifiers.split(',').map(x=>x.trim()).filter(Boolean),
    routing:[
      { state:'Exit', priority:1, rule:'Hard negative, or Fit ≤3 and Need ≤3, or Total <20 unless the Nurture rule applies', action:'Do not send to sales. Close, suppress or redirect the lead.' },
      { state:'Sales Ready', priority:2, rule:'Total ≥30, Fit ≥7, Need ≥7, Authority ≥3, Timing ≥3, and no hard negative', action:'Send to the sales path: booking, reminders and CRM opportunity handling.' },
      { state:'Nurture', priority:3, rule:'Fit ≥7 and Need ≥7, but Timing ≤2, and no hard negative', action:'Keep the lead in a relevant nurture journey until intent increases.' },
      { state:'Potential Fit', priority:4, rule:'Total ≥20 and not already classified as Sales Ready, Nurture or Exit', action:'Continue qualification or use targeted follow-up before sending to sales.' }
    ],
    routingOrder:['Exit','Sales Ready','Nurture','Potential Fit']
  }
}
