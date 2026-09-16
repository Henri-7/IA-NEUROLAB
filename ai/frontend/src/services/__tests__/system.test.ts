import { afterEach, describe, expect, it, vi } from 'vitest'
import { getHealth, getSystemStatus } from '../system'
import { jsonResponse } from './fixtures'

describe('system service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('carrega e mapeia capacidades do sistema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      service: 'neurolab-ai', version: '0.1.0', environment: 'test',
      provider: 'gemini', model: 'gemini-3.6-flash',
      capabilities: { chat: false, document_processing: false, scientific_analysis: false, research: false, rag: false, ai_provider: false },
    })))
    const status = await getSystemStatus()
    expect(status.capabilities).toEqual({ chat: false, documentProcessing: false, scientificAnalysis: false, research: false, rag: false, aiProvider: false })
    expect(status).toMatchObject({ provider: 'gemini', model: 'gemini-3.6-flash' })
  })

  it('carrega health fora do prefixo da API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 'ok', service: 'neurolab-ai' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getHealth()).resolves.toEqual({ status: 'ok', service: 'neurolab-ai' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/health'), expect.any(Object))
  })
})
