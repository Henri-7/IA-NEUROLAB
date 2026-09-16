import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendChatMessage } from '../chat'
import { jsonResponse } from './fixtures'

describe('chat service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('trata 503 AI_NOT_CONFIGURED como erro conhecido', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'AI_NOT_CONFIGURED', message: 'A assistente ainda não está configurada.' } }, 503))
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendChatMessage({ message: 'Teste.', contextType: 'all_documents' })).rejects.toMatchObject({ status: 503, code: 'AI_NOT_CONFIGURED', kind: 'api' })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(request.body as string)).toEqual({
      message: 'Teste.',
      context_type: 'all_documents',
      document_ids: [],
      analysis_ids: [],
    })
  })

  it('mapeia uma resposta real sem fontes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      id: '11111111-1111-4111-8111-111111111111',
      answer: 'Olá! Sou a NeuroLab AI.',
      sources: [],
      insufficient_information: false,
      created_at: '2026-09-16T12:00:00Z',
    })))

    await expect(sendChatMessage({ message: 'Olá.', contextType: 'all_documents' })).resolves.toMatchObject({
      answer: 'Olá! Sou a NeuroLab AI.',
      sources: [],
      insufficientInformation: false,
    })
  })
})
