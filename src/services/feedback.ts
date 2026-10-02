import type { FeedbackFormData, FeedbackSource } from '../features/feedback/feedback.schemas'
import { http } from '../lib/http'

export type CreateFeedback = FeedbackFormData & {
  source: FeedbackSource
}

export const feedbackService = {
  create: (feedback: CreateFeedback) =>
    http<void>('/feedback', {
      method: 'POST',
      body: feedback,
    }),
}
