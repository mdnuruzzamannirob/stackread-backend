import type { RequestHandler } from 'express'
import express from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import { reportsController } from './controller'
import { reportsValidation } from './validation'

const router = express.Router()

router.post(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.REPORTS_MANAGE),
  validateRequest({
    body: reportsValidation.createBody,
  }),
  reportsController.createReportJob as RequestHandler,
)

router.get(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  validateRequest({
    query: reportsValidation.listQuery,
  }),
  reportsController.listReportJobs as RequestHandler,
)

router.get(
  '/admin-overview',
  authenticateStaff,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  reportsController.adminOverviewSnapshot as RequestHandler,
)

router.post(
  '/process',
  authenticateStaff,
  requirePermission(PERMISSIONS.REPORTS_MANAGE),
  reportsController.processPendingReports as RequestHandler,
)

router.get(
  '/:reportId',
  authenticateStaff,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  validateRequest({
    params: reportsValidation.reportIdParam,
  }),
  reportsController.getReportJob as RequestHandler,
)

router.get(
  '/:reportId/download',
  authenticateStaff,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  validateRequest({
    params: reportsValidation.reportIdParam,
  }),
  reportsController.downloadReport as RequestHandler,
)

export const reportsRouter = router
