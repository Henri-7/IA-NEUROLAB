import { afterEach, describe, expect, it, vi } from 'vitest'
import { compareStudies } from '../comparisons'
import { analysisSummaryFixture, jsonResponse } from './fixtures'

const secondId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'

describe('comparisons service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envia exatamente dois IDs no payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      studies: [{ analysis_id: analysisSummaryFixture.id, title: 'A' }, { analysis_id: secondId, title: 'B' }],
      rows: [{ key: 'population', label: 'População', left: 'A', right: 'B' }],
      common_points: [], differences: [], contradictions: [], demo: true,
    }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await compareStudies([analysisSummaryFixture.id, secondId])
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(request.body as string)).toEqual({ analysis_ids: [analysisSummaryFixture.id, secondId] })
    expect(result).toMatchObject({ leftStudyId: analysisSummaryFixture.id, rightStudyId: secondId, demo: true })
  })

  it('rejeita quantidade diferente de dois', async () => {
    await expect(compareStudies([analysisSummaryFixture.id])).rejects.toMatchObject({ code: 'INVALID_COMPARISON' })
  })

  it('rejeita IDs duplicados sem chamar a rede', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(compareStudies([analysisSummaryFixture.id, analysisSummaryFixture.id])).rejects.toMatchObject({ code: 'INVALID_COMPARISON' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

