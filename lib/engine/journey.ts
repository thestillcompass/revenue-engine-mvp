export function generateJourney(args:{modules:string[], entry:string, goal:string, crm:string, booking:string, nurture?:boolean}) {
  const b:{code:string,name:string,description:string}[]=[]
  b.push({code:'J1',name:args.entry,description:'Lead enters the revenue engine'})
  b.push({code:'J2',name:'Welcome + Intent',description:'Establish why the prospect engaged'})
  if(args.modules.includes('M2')) b.push({code:'J2A',name:'Capture',description:'Capture identity, source and contact details'})
  if(args.modules.includes('M3')) b.push({code:'J3',name:'CQF Qualification',description:'Score Fit, Need, Value, Authority and Timing'})
  b.push({code:'J4',name:'Routing',description:'Sales Ready / Nurture / Exit'})
  if(args.modules.includes('M4')) {
    b.push({code:'J5',name:`Booking · ${args.booking}`,description:`Primary goal: ${args.goal}`})
    b.push({code:'J6',name:'Booking Recovery',description:'Follow up with qualified non-bookers'})
    b.push({code:'J8',name:'Reminder + Attendance',description:'Confirmation, reminders and no-show recovery'})
  }
  if(args.modules.includes('M5') || args.nurture) b.push({code:'J7',name:'Nurture',description:'Contextual follow-up and requalification'})
  b.push({code:'J10',name:`CRM · ${args.crm}`,description:'Persist structured lead and journey data'})
  if(args.modules.includes('M6') || args.modules.includes('M7')) b.push({code:'J11',name:'Revenue Measurement',description:'Track Qualified → Booked → Attended → Won → Revenue'})
  b.push({code:'J12',name:'Human Escalation',description:'Escalate high-value or complex conversations with context'})
  return b
}
