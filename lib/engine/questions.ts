export type PillarCode = 'A' | 'C' | 'Q' | 'V' | 'N' | 'M'

export type DiagnosticQuestion = {
  key: string
  pillar: PillarCode
  label: string
}

export const pillars: { code: PillarCode; name: string; description: string }[] = [
  { code: 'A', name: 'Acquisition', description: 'Are enough of the right people entering the funnel?' },
  { code: 'C', name: 'Capture', description: 'Are enquiries captured quickly and reliably?' },
  { code: 'Q', name: 'Qualification', description: 'Can the business identify which leads are worth pursuing?' },
  { code: 'V', name: 'Conversion', description: 'Do qualified prospects become booked and attended conversations?' },
  { code: 'N', name: 'Nurture', description: 'What happens to good prospects who are not ready now?' },
  { code: 'M', name: 'Measurement', description: 'Can marketing activity be connected to commercial outcomes?' }
]

export const questions: DiagnosticQuestion[] = [
  { key:'A1', pillar:'A', label:'Do you consistently generate new enquiries or leads each month?' },
  { key:'A2', pillar:'A', label:'Do you have at least one reliable source of new prospects?' },
  { key:'A3', pillar:'A', label:'How confident are you that your campaigns/content attract the right potential buyers?' },
  { key:'A4', pillar:'A', label:'Is it immediately clear what action a prospect should take after seeing your ad/content?' },
  { key:'A5', pillar:'A', label:'Can you reliably determine which campaigns or channels generate enquiries?' },
  { key:'C1', pillar:'C', label:'How quickly does a new social or media enquiry receive a response?' },
  { key:'C2', pillar:'C', label:'Are all incoming leads captured into one structured system?' },
  { key:'C3', pillar:'C', label:'Do you consistently capture enough contact information to follow up?' },
  { key:'C4', pillar:'C', label:'Can a prospect move smoothly from social engagement into the next step?' },
  { key:'C5', pillar:'C', label:'Does the system retain where the lead originally came from?' },
  { key:'Q1', pillar:'Q', label:'Does the business have a written definition of what makes a lead worth pursuing?' },
  { key:'Q2', pillar:'Q', label:'Are all inbound prospects assessed using the same qualification criteria?' },
  { key:'Q3', pillar:'Q', label:'Does qualification assess whether the opportunity is commercially worthwhile?' },
  { key:'Q4', pillar:'Q', label:'Does the system distinguish between someone researching and someone ready to act?' },
  { key:'Q5', pillar:'Q', label:'Are prospects routed differently based on qualification?' },
  { key:'V1', pillar:'V', label:'Can a qualified prospect immediately book the appropriate next step?' },
  { key:'V2', pillar:'V', label:'What happens if a qualified prospect does not book?' },
  { key:'V3', pillar:'V', label:'Are booked prospects reminded and encouraged to attend?' },
  { key:'V4', pillar:'V', label:'Does the salesperson receive enough context before the consultation?' },
  { key:'V5', pillar:'V', label:'Does the business know what happens after the consultation?' },
  { key:'N1', pillar:'N', label:'What happens when a good-fit prospect is not ready today?' },
  { key:'N2', pillar:'N', label:'Does nurture reflect why the prospect originally enquired?' },
  { key:'N3', pillar:'N', label:'Can the business follow up across appropriate channels?' },
  { key:'N4', pillar:'N', label:'Is there a process for reviving dormant leads?' },
  { key:'N5', pillar:'N', label:'Can the system recognize when a previously cold lead becomes sales-ready?' },
  { key:'M1', pillar:'M', label:'Can you identify where each lead came from?' },
  { key:'M2', pillar:'M', label:'Do you know how many leads become qualified, booked, attended and sold?' },
  { key:'M3', pillar:'M', label:'Can you calculate cost per qualified lead, booked call or attended consultation?' },
  { key:'M4', pillar:'M', label:'Can you connect customer revenue back to the original campaign or source?' },
  { key:'M5', pillar:'M', label:'Do you regularly use conversion data to improve marketing and automation?' }
]

export const maturityLabels = [
  'Missing',
  'Ad hoc',
  'Basic',
  'Structured',
  'Optimized'
]
