import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendChatMessage } from '../chat'
import { jsonResponse } from './fixtures'

describe('chat service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('trata 501 AI_NOT_CONFIGURED como erro conhecido', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'AI_NOT_CONFIGURED', message: 'O modelo da NeuroLab AI ainda não foi configurado.' } }, 501))
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendChatMessage({ message: 'Teste.', contextType: 'all_documents' })).rejects.toMatchObject({ status: 501, code: 'AI_NOT_CONFIGURED', kind: 'api' })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(request.body as string)).toEqual({
      message: 'Teste.',
      context_type: 'all_documents',
      document_ids: [],
      analysis_ids: [],
    })
  })
})
