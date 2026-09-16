import type {
  ApiAnalysisDetail,
  ApiAnalysisStatus,
  ApiAnalysisSummary,
  ApiChatResponse,
  ApiComparisonResponse,
  ApiDocumentStatus,
  ApiDocumentSummary,
  ApiEvidenceStatus,
  ApiReviewItem,
  ApiSourceReference,
  ApiSystemStatus,
} from '../types/api'
import type {
  ChatResponse,
  DocumentStatus,
  DocumentSummary,
  EvidenceState,
  ReviewItem,
  ReviewStatus,
  ScientificAnalysis,
  ScientificAnalysisSummary,
  SourceReference,
  StudyComparison,
  SystemStatus,
} from '../types/scientific'

const analysisStatusMap: Record<ApiAnalysisStatus, ReviewStatus> = {
  in_progress: 'Em análise',
  pending_review: 'Aguardando revisão',
  reviewed: 'Revisado',
}

const documentStatusMap: Record<ApiDocumentStatus, DocumentStatus> = {
  ready: 'Pronto',
  processing: 'Processando',
  error: 'Erro',
}

const evidenceStatusMap: Record<ApiEvidenceStatus, EvidenceState> = {
  found: 'Encontrada',
  missing: 'Ausente',
  ambiguous: 'Ambígua',
  unverifiable: 'Não verificável',
}

export function formatApiDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data indisponível'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function mapDocument(document: ApiDocumentSummary): DocumentSummary {
  return {
    id: document.id,
    title: document.title,
    fileName: document.filename,
    type: document.file_type.toUpperCase() as DocumentSummary['type'],
    version: document.version,
    status: documentStatusMap[document.status],
    addedAt: formatApiDate(document.created_at),
    updatedAt: formatApiDate(document.updated_at),
    demo: document.demo,
  }
}

export function mapSource(source: ApiSourceReference): SourceReference {
  return {
    documentId: source.document_id,
    documentTitle: source.document_title,
    page: source.page,
    section: source.section,
    excerpt: source.excerpt,
    sourceType: source.source_type,
    demo: source.demo,
  }
}

export function mapAnalysisSummary(analysis: ApiAnalysisSummary): ScientificAnalysisSummary {
  return {
    id: analysis.id,
    title: analysis.title,
    year: analysis.year,
    documentId: analysis.document_id,
    documentTitle: analysis.document_title,
    documentVersion: analysis.document_version,
    status: analysisStatusMap[analysis.status],
    analyzedAt: formatApiDate(analysis.created_at),
    updatedAt: formatApiDate(analysis.updated_at),
    demo: analysis.demo,
  }
}

export function mapAnalysis(analysis: ApiAnalysisDetail): ScientificAnalysis {
  return {
    ...mapAnalysisSummary(analysis),
    authors: analysis.authors,
    identifier: analysis.identifier,
    fields: analysis.fields.map((field) => ({
      id: field.key,
      label: field.label,
      value: field.value,
      state: evidenceStatusMap[field.evidence_status],
      sources: field.sources.map(mapSource),
    })),
  }
}

export function mapReview(review: ApiReviewItem): ReviewItem {
  return {
    analysisId: review.analysis_id,
    documentId: review.document_id,
    status: review.status === 'pending' ? 'Aguardando revisão' : 'Revisado',
    reviewedAt: review.reviewed_at ? formatApiDate(review.reviewed_at) : null,
    reviewer: review.reviewer,
    demo: review.demo,
  }
}

export function mapComparison(comparison: ApiComparisonResponse): StudyComparison {
  return {
    leftStudyId: comparison.studies[0].analysis_id,
    rightStudyId: comparison.studies[1].analysis_id,
    rows: comparison.rows.map((row) => ({ label: row.label, left: row.left, right: row.right })),
    commonPoints: comparison.common_points,
    differences: comparison.differences,
    contradictions: comparison.contradictions,
    demo: comparison.demo,
  }
}

export function mapSystemStatus(status: ApiSystemStatus): SystemStatus {
  return {
    service: status.service,
    version: status.version,
    environment: status.environment,
    provider: status.provider,
    model: status.model,
    capabilities: {
      chat: status.capabilities.chat,
      documentProcessing: status.capabilities.document_processing,
      scientificAnalysis: status.capabilities.scientific_analysis,
      research: status.capabilities.research,
      rag: status.capabilities.rag,
      aiProvider: status.capabilities.ai_provider,
    },
  }
}

export function mapChatResponse(response: ApiChatResponse): ChatResponse {
  return {
    id: response.id,
    answer: response.answer,
    sources: response.sources.map(mapSource),
    insufficientInformation: response.insufficient_information,
    createdAt: response.created_at,
  }
}
