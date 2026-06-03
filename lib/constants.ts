export const VENUES = ['USCIT','CAFC','SCOTUS','PACER-District','ICC','HKIAC','SIAC','CIETAC','WTO','Other'] as const
export const DISPUTE_TYPES = ['Commercial Contract','Tariff Legality','Both'] as const
export const OUTCOMES = ['Chinese Party Won','US Party Won','Settled','Pending','Mixed','Dismissed','Unknown'] as const
export const STATUSES = ['Pending','Decided','Settled','On Appeal','Dismissed','Withdrawn'] as const
export const PARTY_TYPES = ['Private Company','SOE','Government','Individual','Industry Group','Unknown'] as const
export const CONFIDENCE_LEVELS = ['High','Medium','Low'] as const
export const SOURCE_TYPES = ['PACER','USCIT','CAFC','WTO','Law Review','News','Firm Alert','Think Tank','Other'] as const
export const TARIFF_BASIS_OPTIONS = ['Section 301','Section 232','Section 201','IEEPA','Retaliatory','Other'] as const
export const INDUSTRIES = [
  'Electronics','Machinery','Agriculture','Minerals & Materials',
  'Consumer Goods','Chemicals','Steel & Aluminum','Textiles',
  'Automotive','Semiconductors','Solar Energy','Medical Devices','Other'
] as const

export const OUTCOME_COLORS: Record<string, string> = {
  'Chinese Party Won': 'bg-red-100 text-red-800',
  'US Party Won':      'bg-blue-100 text-blue-800',
  'Settled':           'bg-green-100 text-green-800',
  'Pending':           'bg-yellow-100 text-yellow-800',
  'Mixed':             'bg-purple-100 text-purple-800',
  'Dismissed':         'bg-gray-100 text-gray-800',
  'Unknown':           'bg-gray-100 text-gray-600',
}

export const PHASE_LABELS: Record<number, string> = {
  1: 'Phase 1 (2018–2022)',
  2: 'Phase 2 (2025–present)',
}
