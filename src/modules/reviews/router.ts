import { Router } from 'express'

import {
  authenticateStaff,
  authenticateUser,
} from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createReview,
  deleteReview,
  listPublicBookReviews,
  listReviewsForAdmin,
  toggleReviewVisibility,
  updateReview,
} from './controller'
import { reviewsValidation } from './validation'

const router = Router()

router.get(
  '/books/:bookId/reviews',
  validateRequest({
    params: reviewsValidation.bookParam,
    query: reviewsValidation.query,
  }),
  listPublicBookReviews,
)
router.post(
  '/books/:bookId/reviews',
  authenticateUser,
  validateRequest({
    params: reviewsValidation.bookParam,
    body: reviewsValidation.createBody,
  }),
  createReview,
)
router.patch(
  '/books/:bookId/reviews/:id',
  authenticateUser,
  validateRequest({
    params: reviewsValidation.reviewNestedParam,
    body: reviewsValidation.updateBody,
  }),
  updateReview,
)
router.delete(
  '/books/:bookId/reviews/:id',
  authenticateUser,
  validateRequest({ params: reviewsValidation.reviewNestedParam }),
  deleteReview,
)

router.get(
  '/admin/reviews',
  authenticateStaff,
  requirePermission('reviews.view'),
  validateRequest({ query: reviewsValidation.query }),
  listReviewsForAdmin,
)
router.patch(
  '/admin/reviews/:id/toggle',
  authenticateStaff,
  requirePermission('reviews.manage'),
  validateRequest({
    params: reviewsValidation.idParam,
    body: reviewsValidation.toggleVisibilityBody,
  }),
  toggleReviewVisibility,
)

export const reviewsRouter = router
