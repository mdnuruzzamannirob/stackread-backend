import type { RequestHandler } from 'express'
import express from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import { settingsController } from './controller'
import { settingsValidation } from './validation'

const router = express.Router()

router.get(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.SETTINGS_VIEW),
  settingsController.getGlobalSettings as RequestHandler,
)

router.put(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  validateRequest({
    body: settingsValidation.updateBody,
  }),
  settingsController.updateGlobalSettings as RequestHandler,
)

router.get(
  '/maintenance',
  settingsController.getMaintenanceState as RequestHandler,
)

export const settingsRouter = router
