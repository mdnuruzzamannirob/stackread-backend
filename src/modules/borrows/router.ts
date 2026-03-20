import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
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
  requirePermission(PERMISSIONS.BORROWS_VIEW),
  validateRequest({ query: borrowsValidation.query }),
  listBorrows,
)
router.patch(
  '/borrows/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.BORROWS_MANAGE),
  validateRequest({
    params: borrowsValidation.idParam,
    body: borrowsValidation.staffUpdateBody,
  }),
  staffUpdateBorrow,
)

export const borrowsRouter = router
