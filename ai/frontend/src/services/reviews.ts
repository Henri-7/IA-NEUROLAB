import type { ApiReviewItem } from '../types/api'
import type { ReviewItem } from '../types/scientific'
import { apiRequest } from './api'
import { mapReview } from './mappers'

export async function listReviews(signal?: AbortSignal): Promise<ReviewItem[]> {
  const reviews = await apiRequest<ApiReviewItem[]>('/api/v1/reviews', { signal })
  return reviews.map(mapReview)
}

