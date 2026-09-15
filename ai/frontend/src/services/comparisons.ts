import type { ApiComparisonRequest, ApiComparisonResponse } from '../types/api'
import type { StudyComparison } from '../types/scientific'
import { ApiClientError, apiRequest } from './api'
import { mapComparison } from './mappers'

export async function compareStudies(ids: string[], signal?: AbortSignal): Promise<StudyComparison> {
  if (ids.length !== 2 || ids[0] === ids[1]) {
    throw new ApiClientError('Selecione exatamente duas análises diferentes.', 422, 'INVALID_COMPARISON', 'api')
  }
  const payload: ApiComparisonRequest = { analysis_ids: ids }
  const comparison = await apiRequest<ApiComparisonResponse>('/api/v1/comparisons', {
    method: 'POST',
    body: payload,
    signal,
  })
  return mapComparison(comparison)
}

