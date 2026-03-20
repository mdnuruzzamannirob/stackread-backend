import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  listAuthors,
  updateAuthor,
} from './controller'
import { authorsValidation } from './validation'

const router = Router()

router.get(
  '/',
  validateRequest({ query: authorsValidation.query }),
  listAuthors,
)
router.get(
  '/:id',
  validateRequest({ params: authorsValidation.idParam }),
  getAuthorById,
)

router.post(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.AUTHORS_MANAGE),
  validateRequest({ body: authorsValidation.createBody }),
  createAuthor,
)
router.put(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.AUTHORS_MANAGE),
  validateRequest({
    params: authorsValidation.idParam,
    body: authorsValidation.updateBody,
  }),
  updateAuthor,
)
router.delete(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.AUTHORS_MANAGE),
  validateRequest({ params: authorsValidation.idParam }),
  deleteAuthor,
)

export const authorsRouter = router
