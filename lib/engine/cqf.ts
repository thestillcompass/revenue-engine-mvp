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
    { dimension:'Fit', max:10, prompt:`Which option best describes your business relative to: ${input.fit || 'our ideal customer profile'}?`, type:'single-select' },
    { dimension:'Need', max:10, prompt:`Which challenge is most important right now${needs.length ? ` (${needs.slice(0,3).join(', ')})` : ''}?`, type:'single-select' },
    { dimension:'Value', max:10, prompt:`Which range best reflects the commercial threshold: ${input.value || 'your business size / engagement value'}?`, type:'range' },
    { dimension:'Authority', max:5, prompt:`Which best describes your role${authorities.length ? ` (${authorities.slice(0,3).join(', ')})` : ''}?`, type:'single-select' },
    { dimension:'Timing', max:5, prompt:'When are you realistically looking to address this?', type:'timeline' }
  ]
  return {
    framework:'FNVAT', maxScore:40,
    questions,
    thresholds:{ salesReady:30, potential:20, nurture:10 },
    minimums:{ fit:7, need:7, authority:3, timing:3 },
    disqualifiers:input.disqualifiers.split(',').map(x=>x.trim()).filter(Boolean),
    routing:[
      { state:'Sales Ready', rule:'Total ≥30, Fit ≥7, Need ≥7, Authority ≥3, Timing ≥3, no hard negative' },
      { state:'Potential Fit', rule:'Total 20–29, or strong total with one required dimension below minimum' },
      { state:'Nurture', rule:'Good Fit + Need, but Timing ≤2' },
      { state:'Exit', rule:'Hard negative, or Fit ≤3 and Need ≤3' }
    ]
  }
}
