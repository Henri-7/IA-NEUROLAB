import type { ApiDocumentDetail, ApiDocumentSummary } from '../types/api'
import type { DocumentDetail, DocumentSummary } from '../types/scientific'
import { apiRequest } from './api'
import { mapDocument } from './mappers'

export async function listDocuments(signal?: AbortSignal): Promise<DocumentSummary[]> {
  const documents = await apiRequest<ApiDocumentSummary[]>('/api/v1/documents', { signal })
  return documents.map(mapDocument)
}

export async function getDocument(id: string, signal?: AbortSignal): Promise<DocumentDetail> {
  const document = await apiRequest<ApiDocumentDetail>(`/api/v1/documents/${encodeURIComponent(id)}`, { signal })
  return mapDocument(document)
}

