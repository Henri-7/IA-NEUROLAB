import type { ApiChatRequest, ApiChatResponse } from '../types/api'
import type { ChatRequest, ChatResponse } from '../types/scientific'
import { apiRequest } from './api'
import { mapChatResponse } from './mappers'

export async function sendChatMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  const payload: ApiChatRequest = {
    message: request.message,
    context_type: request.contextType,
    document_ids: request.documentIds ?? [],
    analysis_ids: request.analysisIds ?? [],
  }
  const response = await apiRequest<ApiChatResponse>('/api/v1/chat', { method: 'POST', body: payload, signal })
  return mapChatResponse(response)
}

