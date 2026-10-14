import { questions } from './questions'
import type { BusinessProfile } from './diagnostic'
import type { CqfInput } from './cqf'

const answerKeys = new Set(questions.map(q => q.key))
const journeyEntries = new Set(['Instagram DM keyword','Instagram comment trigger','Meta click-to-message ad','Website CTA'])
const journeyGoals = new Set(['Book consultation','Generate qualified enquiry','Schedule appointment'])

export function validateDiagnosticInput(profile:any, answers:any): string | null {
  if (!profile || typeof profile !== 'object') return 'Business profile is required.'
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return 'Diagnostic answers are required.'

  const keys = Object.keys(answers)
  if (keys.length !== questions.length || questions.some(q => !(q.key in answers))) {
    return 'Complete all 30 diagnostic questions.'
  }
  for (const key of keys) {
    if (!answerKeys.has(key)) return 'Diagnostic answers contain an unknown question.'
    const value = answers[key]
    if (!Number.isInteger(value) || value < 0 || value > 4) return 'Each diagnostic answer must be a score from 0 to 4.'
  }

  const p = profile as BusinessProfile
  if (typeof p.businessName !== 'string' || p.businessName.trim().length < 2) return 'Enter a business or workspace name.'
  if (typeof p.offer !== 'string' || p.offer.trim().length < 2) return 'Enter your primary offer.'
  if (typeof p.idealCustomer !== 'string' || p.idealCustomer.trim().length < 2) return 'Enter your ideal customer.'
  if (!Number.isFinite(p.avgValue) || p.avgValue <= 0) return 'Average customer value must be greater than zero.'
  if (!Number.isFinite(p.monthlyLeads) || p.monthlyLeads < 0) return 'Monthly enquiries cannot be negative.'
  if (!Number.isInteger(p.offersCount) || p.offersCount < 0 || p.offersCount > 2) return 'Invalid number-of-offers selection.'
  if (!Number.isInteger(p.salesUsers) || p.salesUsers < 0 || p.salesUsers > 2) return 'Invalid sales-users selection.'
  if (!Number.isInteger(p.capability) || p.capability < 0 || p.capability > 2) return 'Invalid implementation-comfort selection.'
  if (!Number.isInteger(p.bookingComplexity) || p.bookingComplexity < 0 || p.bookingComplexity > 2) return 'Invalid booking-complexity selection.'
  return null
}

export function validateCqfInput(input:any): string | null {
  if (!input || typeof input !== 'object') return 'Qualification inputs are required.'
  const required: Array<keyof CqfInput> = ['fit','need','value','authority']
  for (const key of required) {
    if (typeof input[key] !== 'string' || input[key].trim().length < 2) return 'Complete the ideal customer, problem, commercial threshold and decision-maker fields.'
    if (input[key].length > 1000) return 'Qualification inputs are too long.'
  }
  if (!['30','90','180'].includes(input.timing)) return 'Choose a valid timing option.'
  if (input.disqualifiers != null && (typeof input.disqualifiers !== 'string' || input.disqualifiers.length > 1000)) return 'Invalid disqualifier input.'
  return null
}

export function validateJourneyConfig(config:any): string | null {
  if (!config || typeof config !== 'object') return 'Journey configuration is required.'
  if (!journeyEntries.has(config.entry)) return 'Choose a valid entry method.'
  if (!journeyGoals.has(config.goal)) return 'Choose a valid conversion goal.'
  if (typeof config.nurture !== 'boolean') return 'Invalid nurture setting.'
  return null
}

export function validateMetricInputs(input:any): string | null {
  if (!input || typeof input !== 'object') return 'Revenue inputs are required.'
  const keys = ['spend','conversations','qualified','booked','attended','won','revenue'] as const
  for (const key of keys) {
    if (!Number.isFinite(input[key]) || input[key] < 0) return 'Revenue Intelligence values must be valid non-negative numbers.'
  }
  const countKeys = ['conversations','qualified','booked','attended','won'] as const
  for (const key of countKeys) {
    if (!Number.isInteger(input[key])) return 'Lead and conversion counts must be whole numbers.'
  }
  if (input.qualified > input.conversations) return 'Qualified leads cannot exceed conversations.'
  if (input.booked > input.qualified) return 'Booked consultations cannot exceed qualified leads.'
  if (input.attended > input.booked) return 'Attended consultations cannot exceed bookings.'
  if (input.won > input.attended) return 'Won customers cannot exceed attended consultations.'
  return null
}
