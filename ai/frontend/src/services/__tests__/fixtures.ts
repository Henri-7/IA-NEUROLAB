import type { ApiAnalysisDetail, ApiAnalysisSummary, ApiDocumentSummary, ApiReviewItem } from '../../types/api'

export const documentFixture: ApiDocumentSummary = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Documento científico demonstrativo A',
  filename: 'documento_demo_a.pdf',
  file_type: 'pdf',
  version: 'v1.0',
  status: 'ready',
  created_at: '2026-09-10T12:00:00Z',
  updated_at: '2026-09-12T15:30:00Z',
  demo: true,
}

export const analysisSummaryFixture: ApiAnalysisSummary = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  document_id: documentFixture.id,
  document_title: documentFixture.title,
  title: 'Análise demonstrativa A',
  year: null,
  document_version: 'v1.0',
  status: 'pending_review',
  created_at: '2026-09-10T12:00:00Z',
  updated_at: '2026-09-12T15:30:00Z',
  demo: true,
}

export const analysisDetailFixture: ApiAnalysisDetail = {
  ...analysisSummaryFixture,
  authors: ['Autoria demonstrativa'],
  identifier: 'DEMO-A',
  fields: [{
    key: 'objective',
    label: 'Objetivo',
    value: 'Conteúdo demonstrativo.',
    evidence_status: 'found',
    sources: [{
      document_id: documentFixture.id,
      document_title: documentFixture.title,
      page: 1,
      section: 'Seção demonstrativa',
      excerpt: 'Trecho demonstrativo.',
      source_type: 'document',
      demo: true,
    }],
  }],
}

export const reviewFixture: ApiReviewItem = {
  analysis_id: analysisSummaryFixture.id,
  document_id: documentFixture.id,
  status: 'pending',
  reviewed_at: null,
  reviewer: null,
  demo: true,
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

