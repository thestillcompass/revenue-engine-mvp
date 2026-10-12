export function calculateMetrics(input:{spend:number, conversations:number, qualified:number, booked:number, attended:number, won:number, revenue:number}) {
  const pct=(a:number,b:number)=>b?Number((a/b*100).toFixed(1)):0
  const div=(a:number,b:number)=>b?Number((a/b).toFixed(2)):0
  const stages=[
    {key:'conversation_to_qualified',label:'Conversation → Qualified',rate:pct(input.qualified,input.conversations)},
    {key:'qualified_to_booked',label:'Qualified → Booked',rate:pct(input.booked,input.qualified)},
    {key:'booked_to_attended',label:'Booked → Attended',rate:pct(input.attended,input.booked)},
    {key:'attended_to_won',label:'Attended → Won',rate:pct(input.won,input.attended)}
  ]
  const weakest=[...stages].sort((a,b)=>a.rate-b.rate)[0]
  const signal=input.conversations<10?'Insufficient data':input.conversations<30?'Early signal':'Actionable directional signal'
  let recommendation='Collect more data before changing the system.'
  if(input.conversations>=10){
    if(weakest.key==='conversation_to_qualified') recommendation='Review traffic quality, CQF questions and qualification thresholds.'
    if(weakest.key==='qualified_to_booked') recommendation='Reduce booking friction and strengthen the immediate booking CTA.'
    if(weakest.key==='booked_to_attended') recommendation='Improve confirmation, reminder and no-show prevention.'
    if(weakest.key==='attended_to_won') recommendation='The largest constraint may now sit in sales execution, offer fit or pricing.'
  }
  return {
    costPerConversation:div(input.spend,input.conversations),
    costPerQualifiedLead:div(input.spend,input.qualified),
    cpqac:div(input.spend,input.attended),
    cac:div(input.spend,input.won),
    revenuePerAdSpend:div(input.revenue,input.spend),
    revenuePerAttended:div(input.revenue,input.attended),
    stages, weakest, signal, recommendation
  }
}
