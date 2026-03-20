import type { RequestHandler } from 'express'
import express from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import { auditController } from './controller'
import { auditValidation } from './validation'

const router = express.Router()

router.post(
  '/activity',
  authenticateStaff,
  requirePermission(PERMISSIONS.AUDIT_MANAGE),
  validateRequest({
    body: auditValidation.createBody,
  }),
  auditController.createActivityLog as RequestHandler,
)

router.get(
  '/logs',
  authenticateStaff,
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  validateRequest({
    query: auditValidation.listQuery,
  }),
  auditController.listLogs as RequestHandler,
)

router.get(
  '/logs/export',
  authenticateStaff,
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  validateRequest({
    query: auditValidation.exportQuery,
  }),
  auditController.exportLogs as RequestHandler,
)

export const auditRouter = router
