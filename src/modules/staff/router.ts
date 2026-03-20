import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  getStaffActivity,
  getStaffById,
  inviteStaff,
  listStaff,
  reinviteStaff,
  removeStaff,
  suspendStaff,
  unsuspendStaff,
  updateStaffRole,
} from './controller'
import { staffValidation } from './validation'

const router = Router()

router.use(authenticateStaff)

router.get('/', requirePermission(PERMISSIONS.STAFF_VIEW), listStaff)
router.get(
  '/:id',
  requirePermission(PERMISSIONS.STAFF_VIEW),
  validateRequest({ params: staffValidation.idParam }),
  getStaffById,
)
router.get(
  '/:id/activity',
  requirePermission(PERMISSIONS.STAFF_VIEW),
  validateRequest({ params: staffValidation.idParam }),
  getStaffActivity,
)

router.post(
  '/invite',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest({ body: staffValidation.inviteBody }),
  inviteStaff,
)
router.post(
  '/:id/reinvite',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest({ params: staffValidation.idParam }),
  reinviteStaff,
)
router.patch(
  '/:id/role',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest({
    params: staffValidation.idParam,
    body: staffValidation.updateRoleBody,
  }),
  updateStaffRole,
)
router.patch(
  '/:id/suspend',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest({ params: staffValidation.idParam }),
  suspendStaff,
)
router.patch(
  '/:id/unsuspend',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest({ params: staffValidation.idParam }),
  unsuspendStaff,
)
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest({ params: staffValidation.idParam }),
  removeStaff,
)

export const staffRouter = router
