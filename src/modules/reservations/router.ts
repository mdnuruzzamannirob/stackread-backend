import { Router } from 'express'

import {
  authenticateStaff,
  authenticateUser,
} from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  cancelMyReservation,
  createReservation,
  listMyReservations,
  listReservations,
  staffUpdateReservation,
} from './controller'
import { reservationsValidation } from './validation'

const router = Router()

router.get(
  '/reservations/my',
  authenticateUser,
  validateRequest({ query: reservationsValidation.query }),
  listMyReservations,
)
router.post(
  '/reservations',
  authenticateUser,
  validateRequest({ body: reservationsValidation.createBody }),
  createReservation,
)
router.delete(
  '/reservations/:id',
  authenticateUser,
  validateRequest({ params: reservationsValidation.idParam }),
  cancelMyReservation,
)

router.get(
  '/reservations',
  authenticateStaff,
  requirePermission('reservations.view'),
  validateRequest({ query: reservationsValidation.query }),
  listReservations,
)
router.patch(
  '/reservations/:id',
  authenticateStaff,
  requirePermission('reservations.manage'),
  validateRequest({
    params: reservationsValidation.idParam,
    body: reservationsValidation.staffUpdateBody,
  }),
  staffUpdateReservation,
)

export const reservationsRouter = router
