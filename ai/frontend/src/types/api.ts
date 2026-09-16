export type ApiDocumentStatus = 'ready' | 'processing' | 'error'
export type ApiFileType = 'pdf' | 'docx'
export type ApiAnalysisStatus = 'in_progress' | 'pending_review' | 'reviewed'
export type ApiEvidenceStatus = 'found' | 'missing' | 'ambiguous' | 'unverifiable'
export type ApiReviewStatus = 'pending' | 'reviewed'
export type ApiSourceType = 'document'
export type ApiChatContextType = 'all_documents' | 'selected_documents' | 'specific_analysis'

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
  }
}

export interface ApiHealthResponse {
  status: string
  service: string
}

export interface ApiSystemStatus {
  service: string
  version: string
  environment: string
  provider: string
  model: string
  capabilities: {
    chat: boolean
    document_processing: boolean
    scientific_analysis: boolean
    research: boolean
    rag: boolean
    ai_provider: boolean
  }
}

export interface ApiDocumentSummary {
  id: string
  title: string
  filename: string
  file_type: ApiFileType
  version: string
  status: ApiDocumentStatus
  created_at: string
  updated_at: string
  demo: true
}

export type ApiDocumentDetail = ApiDocumentSummary

export interface ApiSourceReference {
  document_id: string
  document_title: string
  page: number | null
  section: string | null
  excerpt: string
  source_type: ApiSourceType
  demo: true
}

export interface ApiScientificField {
  key: string
  label: string
  value: string
  evidence_status: ApiEvidenceStatus
  sources: ApiSourceReference[]
}

export interface ApiAnalysisSummary {
  id: string
  document_id: string
  document_title: string
  title: string
  year: number | null
  document_version: string
  status: ApiAnalysisStatus
  created_at: string
  updated_at: string
  demo: true
}

export interface ApiAnalysisDetail extends ApiAnalysisSummary {
  authors: string[]
  identifier: string | null
  fields: ApiScientificField[]
}

export interface ApiReviewItem {
  analysis_id: string
  document_id: string
  status: ApiReviewStatus
  reviewed_at: string | null
  reviewer: string | null
  demo: true
}

export interface ApiComparisonRequest {
  analysis_ids: string[]
}

export interface ApiComparisonResponse {
  studies: Array<{ analysis_id: string; title: string }>
  rows: Array<{ key: string; label: string; left: string; right: string }>
  common_points: string[]
  differences: string[]
  contradictions: string[]
  demo: true
}

export interface ApiChatRequest {
  message: string
  context_type: ApiChatContextType
  document_ids: string[]
  analysis_ids: string[]
}

export interface ApiChatResponse {
  id: string
  answer: string
  sources: ApiSourceReference[]
  insufficient_information: boolean
  created_at: string
}
