import { Router } from 'express'

import {
  authenticateStaff,
  authenticateUser,
} from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createBorrow,
  getMyBorrows,
  listBorrows,
  returnBorrow,
  staffUpdateBorrow,
} from './controller'
import { borrowsValidation } from './validation'

const router = Router()

router.get(
  '/borrows/my',
  authenticateUser,
  validateRequest({ query: borrowsValidation.query }),
  getMyBorrows,
)
router.post(
  '/borrows',
  authenticateUser,
  validateRequest({ body: borrowsValidation.createBody }),
  createBorrow,
)
router.post(
  '/borrows/:id/return',
  authenticateUser,
  validateRequest({
    params: borrowsValidation.idParam,
    body: borrowsValidation.returnBody,
  }),
  returnBorrow,
)

router.get(
  '/borrows',
  authenticateStaff,
  requirePermission('borrows.view'),
  validateRequest({ query: borrowsValidation.query }),
  listBorrows,
)
router.patch(
  '/borrows/:id',
  authenticateStaff,
  requirePermission('borrows.manage'),
  validateRequest({
    params: borrowsValidation.idParam,
    body: borrowsValidation.staffUpdateBody,
  }),
  staffUpdateBorrow,
)

export const borrowsRouter = router
