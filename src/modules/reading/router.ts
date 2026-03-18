import { Router } from 'express'

import { authenticateUser } from '../../common/middlewares/auth'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createBookmark,
  createHighlight,
  createReadingSession,
  deleteBookmark,
  deleteHighlight,
  getCompletedReading,
  getCurrentlyReading,
  getReadingHistory,
  listBookmarks,
  listHighlights,
  startReading,
  updateBookmark,
  updateHighlight,
  updateReadingProgress,
} from './controller'
import { readingValidation } from './validation'

const router = Router()

router.use(authenticateUser)

router.post(
  '/reading/:bookId/start',
  validateRequest({
    params: readingValidation.bookParam,
    body: readingValidation.startReadingBody,
  }),
  startReading,
)
router.post(
  '/reading/:bookId/session',
  validateRequest({
    params: readingValidation.bookParam,
    body: readingValidation.createSessionBody,
  }),
  createReadingSession,
)
router.patch(
  '/reading/:bookId/progress',
  validateRequest({
    params: readingValidation.bookParam,
    body: readingValidation.updateProgressBody,
  }),
  updateReadingProgress,
)

router.get(
  '/reading/history',
  validateRequest({ query: readingValidation.paginationQuery }),
  getReadingHistory,
)
router.get(
  '/reading/currently-reading',
  validateRequest({ query: readingValidation.paginationQuery }),
  getCurrentlyReading,
)
router.get(
  '/reading/completed',
  validateRequest({ query: readingValidation.paginationQuery }),
  getCompletedReading,
)

router.get(
  '/books/:bookId/bookmarks',
  validateRequest({ params: readingValidation.bookParam }),
  listBookmarks,
)
router.post(
  '/books/:bookId/bookmarks',
  validateRequest({
    params: readingValidation.bookParam,
    body: readingValidation.createBookmarkBody,
  }),
  createBookmark,
)
router.patch(
  '/books/:bookId/bookmarks/:id',
  validateRequest({
    params: readingValidation.nestedIdParam,
    body: readingValidation.updateBookmarkBody,
  }),
  updateBookmark,
)
router.delete(
  '/books/:bookId/bookmarks/:id',
  validateRequest({ params: readingValidation.nestedIdParam }),
  deleteBookmark,
)

router.get(
  '/books/:bookId/highlights',
  validateRequest({ params: readingValidation.bookParam }),
  listHighlights,
)
router.post(
  '/books/:bookId/highlights',
  validateRequest({
    params: readingValidation.bookParam,
    body: readingValidation.createHighlightBody,
  }),
  createHighlight,
)
router.patch(
  '/books/:bookId/highlights/:id',
  validateRequest({
    params: readingValidation.nestedIdParam,
    body: readingValidation.updateHighlightBody,
  }),
  updateHighlight,
)
router.delete(
  '/books/:bookId/highlights/:id',
  validateRequest({ params: readingValidation.nestedIdParam }),
  deleteHighlight,
)

export const readingRouter = router
