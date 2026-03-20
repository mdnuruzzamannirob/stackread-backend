import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import {
  authenticateStaff,
  authenticateUser,
} from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  adminUpdateSubscription,
  cancelMySubscription,
  createSubscription,
  downgradeMySubscription,
  getMyCurrentSubscription,
  getMySubscriptionHistory,
  getSubscriptionById,
  listSubscriptions,
  renewMySubscription,
  upgradeMySubscription,
} from './controller'
import { subscriptionsValidation } from './validation'

const router = Router()

router.get('/my', authenticateUser, getMyCurrentSubscription)
router.get('/my/history', authenticateUser, getMySubscriptionHistory)
router.patch(
  '/my/cancel',
  authenticateUser,
  validateRequest({ body: subscriptionsValidation.cancelBody }),
  cancelMySubscription,
)
router.patch('/my/renew', authenticateUser, renewMySubscription)
router.patch(
  '/my/upgrade',
  authenticateUser,
  validateRequest({ body: subscriptionsValidation.changePlanBody }),
  upgradeMySubscription,
)
router.patch(
  '/my/downgrade',
  authenticateUser,
  validateRequest({ body: subscriptionsValidation.changePlanBody }),
  downgradeMySubscription,
)

router.get(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.SUBSCRIPTIONS_VIEW),
  listSubscriptions,
)
router.get(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.SUBSCRIPTIONS_VIEW),
  validateRequest({ params: subscriptionsValidation.idParam }),
  getSubscriptionById,
)
router.post(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE),
  validateRequest({ body: subscriptionsValidation.createBody }),
  createSubscription,
)
router.patch(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE),
  validateRequest({
    params: subscriptionsValidation.idParam,
    body: subscriptionsValidation.adminUpdateBody,
  }),
  adminUpdateSubscription,
)

export const subscriptionsRouter = router
