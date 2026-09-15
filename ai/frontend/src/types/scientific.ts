export type ReviewStatus = 'Aguardando revisão' | 'Revisado' | 'Em análise'
export type DocumentStatus = 'Pronto' | 'Processando' | 'Erro'
export type EvidenceState = 'Encontrada' | 'Ausente' | 'Ambígua' | 'Não verificável'
export type DisplayStatus = ReviewStatus | DocumentStatus | EvidenceState | 'Informação insuficiente' | 'Indisponível'

export interface SourceReference {
  documentId: string
  documentTitle: string
  page: number | null
  section: string | null
  excerpt: string
  sourceType: 'document'
  demo: true
}

export interface ScientificField {
  id: string
  label: string
  value: string
  state: EvidenceState
  sources: SourceReference[]
}

export interface DocumentSummary {
  id: string
  title: string
  fileName: string
  type: 'PDF' | 'DOCX'
  addedAt: string
  updatedAt: string
  status: DocumentStatus
  version: string
  demo: true
}

export type DocumentDetail = DocumentSummary

export interface ScientificAnalysisSummary {
  id: string
  title: string
  year: number | null
  documentId: string
  documentTitle: string
  documentVersion: string
  status: ReviewStatus
  analyzedAt: string
  updatedAt: string
  demo: true
}

export interface ScientificAnalysis extends ScientificAnalysisSummary {
  authors: string[]
  identifier: string | null
  fields: ScientificField[]
}

export interface ReviewItem {
  analysisId: string
  documentId: string
  status: Exclude<ReviewStatus, 'Em análise'>
  reviewedAt: string | null
  reviewer: string | null
  demo: true
}

export interface ComparisonRow {
  label: string
  left: string
  right: string
}

export interface StudyComparison {
  leftStudyId: string
  rightStudyId: string
  rows: ComparisonRow[]
  commonPoints: string[]
  differences: string[]
  contradictions: string[]
  demo: true
}

export interface SystemStatus {
  service: string
  version: string
  environment: string
  capabilities: {
    chat: boolean
    documentProcessing: boolean
    scientificAnalysis: boolean
    research: boolean
    rag: boolean
    aiProvider: boolean
  }
}

export interface HealthStatus {
  status: string
  service: string
}

export interface ChatRequest {
  message: string
  contextType: 'all_documents' | 'selected_documents' | 'specific_analysis'
  documentIds?: string[]
  analysisIds?: string[]
}

export interface ChatResponse {
  id: string
  answer: string
  sources: SourceReference[]
  insufficientInformation: boolean
  createdAt: string
}
