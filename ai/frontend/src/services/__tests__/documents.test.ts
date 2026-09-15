import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDocument, listDocuments } from '../documents'
import { documentFixture, jsonResponse } from './fixtures'

describe('documents service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lista e mapeia documentos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([documentFixture])))
    const documents = await listDocuments()
    expect(documents[0]).toMatchObject({ id: documentFixture.id, fileName: documentFixture.filename, type: 'PDF', status: 'Pronto', demo: true })
  })

  it('busca detalhe com UUID na URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(documentFixture))
    vi.stubGlobal('fetch', fetchMock)
    await getDocument(documentFixture.id)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`/api/v1/documents/${documentFixture.id}`), expect.any(Object))
  })

  it('propaga DOCUMENT_NOT_FOUND', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' } }, 404)))
    await expect(getDocument('00000000-0000-4000-8000-000000000000')).rejects.toMatchObject({ code: 'DOCUMENT_NOT_FOUND' })
  })
})
