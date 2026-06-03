export type Phase = 1 | 2

export type CaseStatus =
  | 'Pending'
  | 'Decided'
  | 'Settled'
  | 'On Appeal'
  | 'Dismissed'
  | 'Withdrawn'

export type Venue =
  | 'USCIT'
  | 'CAFC'
  | 'SCOTUS'
  | 'PACER-District'
  | 'ICC'
  | 'HKIAC'
  | 'SIAC'
  | 'CIETAC'
  | 'WTO'
  | 'Other'

export type DisputeType = 'Commercial Contract' | 'Tariff Legality' | 'Both'

export type PartyType =
  | 'Private Company'
  | 'SOE'
  | 'Government'
  | 'Individual'
  | 'Industry Group'
  | 'Unknown'

export type Outcome =
  | 'Chinese Party Won'
  | 'US Party Won'
  | 'Settled'
  | 'Pending'
  | 'Mixed'
  | 'Dismissed'
  | 'Unknown'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export type SourceType =
  | 'PACER'
  | 'USCIT'
  | 'CAFC'
  | 'WTO'
  | 'Law Review'
  | 'News'
  | 'Firm Alert'
  | 'Think Tank'
  | 'Other'

export interface CaseSource {
  id: string
  case_id: string
  url: string
  source_type: SourceType | null
  source_tier: 1 | 2 | 3
  title: string | null
  accessed_date: string | null
}

export interface Case {
  id: string
  case_code: string
  case_name: string
  phase: Phase
  date_filed: string | null
  date_decided: string | null
  status: CaseStatus | null
  venue: Venue | null
  venue_detail: string | null
  dispute_type: DisputeType
  tariff_basis: string[]
  industry: string | null
  industry_subsector: string | null
  chinese_party_name: string | null
  chinese_party_type: PartyType | null
  us_party_name: string | null
  us_party_type: PartyType | null
  dispute_subject: string | null
  key_legal_issues: string[]
  outcome: Outcome | null
  key_ruling: string | null
  key_takeaways: string | null
  similar_case_ids: string[]
  confidence_level: ConfidenceLevel
  freeze_date: string
  is_published: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  case_sources?: CaseSource[]
}

export interface CaseWithSources extends Case {
  case_sources: CaseSource[]
}

export interface UpdateLog {
  id: string
  refresh_date: string
  refreshed_by: string | null
  records_added: number
  records_modified: number
  records_removed: number
  notes: string | null
  status: 'in_progress' | 'completed'
  created_at: string
}

export interface Tag {
  id: string
  name: string
  category: 'legal_theory' | 'industry' | 'procedural' | 'policy'
}

export interface CaseFilters {
  phase?: Phase
  dispute_type?: DisputeType
  outcome?: Outcome
  industry?: string
  tariff_basis?: string
  status?: CaseStatus
  venue?: Venue
  search?: string
  date_from?: string
  date_to?: string
}
