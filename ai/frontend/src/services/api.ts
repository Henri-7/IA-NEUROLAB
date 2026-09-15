import type { ApiErrorResponse } from '../types/api'

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8001'
const DEFAULT_TIMEOUT_MS = 9_000

export type ApiErrorKind = 'api' | 'network' | 'timeout' | 'cancelled' | 'invalid-response'

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly code: string,
    public readonly kind: ApiErrorKind,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

const configuredBaseUrl = import.meta.env.VITE_AI_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
const apiBaseUrl = configuredBaseUrl.replace(/\/+$/, '')

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const error = value.error
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
    && typeof error.code === 'string' && typeof error.message === 'string'
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new ApiClientError(
      'O serviço retornou um formato de resposta inesperado.',
      response.status,
      'INVALID_RESPONSE',
      'invalid-response',
    )
  }
  try {
    return await response.json()
  } catch {
    throw new ApiClientError(
      'O serviço retornou uma resposta JSON inválida.',
      response.status,
      'INVALID_RESPONSE',
      'invalid-response',
    )
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  let timedOut = false

  const abortFromCaller = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) abortFromCaller()
  else options.signal?.addEventListener('abort', abortFromCaller, { once: true })

  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(`${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    })
    const payload = await parseJson(response)
    if (!response.ok) {
      if (isApiErrorResponse(payload)) {
        throw new ApiClientError(payload.error.message, response.status, payload.error.code, 'api')
      }
      throw new ApiClientError('O serviço não conseguiu concluir a solicitação.', response.status, 'HTTP_ERROR', 'api')
    }
    return payload as T
  } catch (error) {
    if (error instanceof ApiClientError) throw error
    if (controller.signal.aborted) {
      if (timedOut) {
        throw new ApiClientError('O serviço demorou mais que o esperado para responder.', null, 'REQUEST_TIMEOUT', 'timeout')
      }
      throw new ApiClientError('A solicitação foi cancelada.', null, 'REQUEST_CANCELLED', 'cancelled')
    }
    throw new ApiClientError('Não foi possível conectar ao serviço NeuroLab AI.', null, 'NETWORK_ERROR', 'network')
  } finally {
    globalThis.clearTimeout(timeoutId)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }
}

const FRIENDLY_API_MESSAGES: Record<string, string> = {
  DOCUMENT_NOT_FOUND: 'O documento solicitado não foi encontrado.',
  ANALYSIS_NOT_FOUND: 'A análise solicitada não foi encontrada.',
  INVALID_COMPARISON: 'Selecione exatamente duas análises diferentes.',
  AI_NOT_CONFIGURED: 'A assistente científica ainda não foi configurada.',
  VALIDATION_ERROR: 'Os dados enviados não são válidos.',
  INTERNAL_ERROR: 'O serviço encontrou um erro interno. Tente novamente.',
  NETWORK_ERROR: 'Não foi possível conectar ao backend da NeuroLab AI. Verifique se o serviço está em execução.',
  REQUEST_TIMEOUT: 'A comunicação com o backend demorou mais que o esperado.',
  INVALID_RESPONSE: 'O backend retornou uma resposta inesperada.',
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) return FRIENDLY_API_MESSAGES[error.code] ?? error.message
  return fallback
}

export function isRequestCancelled(error: unknown): boolean {
  return error instanceof ApiClientError && error.kind === 'cancelled'
}
