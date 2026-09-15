import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../api'
import { jsonResponse } from './fixtures'

describe('apiRequest', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('interpreta resposta JSON 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' })))
    await expect(apiRequest<{ status: string }>('/health')).resolves.toEqual({ status: 'ok' })
  })

  it('converte erro 404 estruturado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' } }, 404)))
    await expect(apiRequest('/api/v1/documents/missing')).rejects.toMatchObject({ status: 404, code: 'DOCUMENT_NOT_FOUND', kind: 'api' })
  })

  it('converte erro 500 estruturado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } }, 500)))
    await expect(apiRequest('/api/v1/documents')).rejects.toMatchObject({ status: 500, code: 'INTERNAL_ERROR' })
  })

  it('diferencia erro de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network failed')))
    await expect(apiRequest('/health')).rejects.toMatchObject({ status: null, code: 'NETWORK_ERROR', kind: 'network' })
  })

  it('cancela requisição após timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const request = apiRequest('/health', { timeoutMs: 20 })
    const expectation = expect(request).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT', kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(21)
    await expectation
  })

  it('rejeita JSON inválido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid', { status: 200, headers: { 'Content-Type': 'application/json' } })))
    await expect(apiRequest('/health')).rejects.toMatchObject({ code: 'INVALID_RESPONSE', kind: 'invalid-response' })
  })
})
