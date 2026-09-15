import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAnalysis, listAnalyses } from '../analyses'
import { analysisDetailFixture, analysisSummaryFixture, jsonResponse } from './fixtures'

describe('analyses service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lista e mapeia resumos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([analysisSummaryFixture])))
    const analyses = await listAnalyses()
    expect(analyses[0]).toMatchObject({ status: 'Aguardando revisão', documentId: analysisSummaryFixture.document_id, demo: true })
  })

  it('mapeia detalhe, campos e fontes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(analysisDetailFixture)))
    const analysis = await getAnalysis(analysisDetailFixture.id)
    expect(analysis.fields[0]).toMatchObject({ id: 'objective', state: 'Encontrada' })
    expect(analysis.fields[0].sources[0]).toMatchObject({ documentId: documentFixtureId(), page: 1, demo: true })
  })

  it('propaga ANALYSIS_NOT_FOUND', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'ANALYSIS_NOT_FOUND', message: 'Análise não encontrada.' } }, 404)))
    await expect(getAnalysis('00000000-0000-4000-8000-000000000000')).rejects.toMatchObject({ code: 'ANALYSIS_NOT_FOUND', status: 404 })
  })
})

function documentFixtureId(): string {
  return analysisDetailFixture.document_id
}

