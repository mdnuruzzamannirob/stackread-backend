import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createRole,
  deleteRole,
  getRoleById,
  listPermissions,
  listRoles,
  updateRole,
} from './controller'
import { rbacValidation } from './validation'

const router = Router()

router.use(authenticateStaff)

router.get(
  '/permissions',
  requirePermission(PERMISSIONS.RBAC_VIEW),
  listPermissions,
)
router.get('/roles', requirePermission(PERMISSIONS.RBAC_VIEW), listRoles)
router.get(
  '/roles/:id',
  requirePermission(PERMISSIONS.RBAC_VIEW),
  validateRequest({ params: rbacValidation.idParam }),
  getRoleById,
)
router.post(
  '/roles',
  requirePermission(PERMISSIONS.RBAC_MANAGE),
  validateRequest({ body: rbacValidation.createRoleBody }),
  createRole,
)
router.put(
  '/roles/:id',
  requirePermission(PERMISSIONS.RBAC_MANAGE),
  validateRequest({
    params: rbacValidation.idParam,
    body: rbacValidation.updateRoleBody,
  }),
  updateRole,
)
router.delete(
  '/roles/:id',
  requirePermission(PERMISSIONS.RBAC_MANAGE),
  validateRequest({ params: rbacValidation.idParam }),
  deleteRole,
)

export const rbacRouter = router
