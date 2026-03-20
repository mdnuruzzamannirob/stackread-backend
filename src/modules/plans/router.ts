import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createPlan,
  getPlanById,
  listPlans,
  togglePlan,
  updatePlan,
} from './controller'
import { plansValidation } from './validation'

const router = Router()

router.get('/', validateRequest({ query: plansValidation.query }), listPlans)
router.get(
  '/:id',
  validateRequest({ params: plansValidation.idParam }),
  getPlanById,
)

router.post(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.PLANS_MANAGE),
  validateRequest({ body: plansValidation.createBody }),
  createPlan,
)
router.put(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.PLANS_MANAGE),
  validateRequest({
    params: plansValidation.idParam,
    body: plansValidation.updateBody,
  }),
  updatePlan,
)
router.patch(
  '/:id/toggle',
  authenticateStaff,
  requirePermission(PERMISSIONS.PLANS_MANAGE),
  validateRequest({ params: plansValidation.idParam }),
  togglePlan,
)

export const plansRouter = router
