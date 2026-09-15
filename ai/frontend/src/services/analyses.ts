import type { ApiAnalysisDetail, ApiAnalysisSummary } from '../types/api'
import type { ScientificAnalysis, ScientificAnalysisSummary } from '../types/scientific'
import { apiRequest } from './api'
import { mapAnalysis, mapAnalysisSummary } from './mappers'

export async function listAnalyses(signal?: AbortSignal): Promise<ScientificAnalysisSummary[]> {
  const analyses = await apiRequest<ApiAnalysisSummary[]>('/api/v1/analyses', { signal })
  return analyses.map(mapAnalysisSummary)
}

export async function getAnalysis(id: string, signal?: AbortSignal): Promise<ScientificAnalysis> {
  const analysis = await apiRequest<ApiAnalysisDetail>(`/api/v1/analyses/${encodeURIComponent(id)}`, { signal })
  return mapAnalysis(analysis)
}

