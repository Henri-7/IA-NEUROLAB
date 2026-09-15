import type { ApiHealthResponse, ApiSystemStatus } from '../types/api'
import type { HealthStatus, SystemStatus } from '../types/scientific'
import { apiRequest } from './api'
import { mapSystemStatus } from './mappers'

export async function getSystemStatus(signal?: AbortSignal): Promise<SystemStatus> {
  const status = await apiRequest<ApiSystemStatus>('/api/v1/system/status', { signal })
  return mapSystemStatus(status)
}

export async function getHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return apiRequest<ApiHealthResponse>('/health', { signal })
}

