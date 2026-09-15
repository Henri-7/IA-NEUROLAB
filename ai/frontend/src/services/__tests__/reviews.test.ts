import { afterEach, describe, expect, it, vi } from 'vitest'
import { listReviews } from '../reviews'
import { jsonResponse, reviewFixture } from './fixtures'

describe('reviews service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lista revisões e converte status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([reviewFixture])))
    await expect(listReviews()).resolves.toEqual([expect.objectContaining({ analysisId: reviewFixture.analysis_id, status: 'Aguardando revisão', demo: true })])
  })
})

