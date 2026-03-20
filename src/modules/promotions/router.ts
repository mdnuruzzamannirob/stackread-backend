import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createCoupon,
  createFlashSale,
  deleteCoupon,
  deleteFlashSale,
  getActiveFlashSales,
  getCouponById,
  listCoupons,
  listFlashSales,
  toggleCoupon,
  toggleFlashSale,
  updateCoupon,
  updateFlashSale,
  validateCoupon,
} from './controller'
import { promotionsValidation } from './validation'

const router = Router()

router.post(
  '/coupons/validate',
  validateRequest({ body: promotionsValidation.validateCouponBody }),
  validateCoupon,
)

router.get(
  '/coupons',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_VIEW),
  listCoupons,
)
router.get(
  '/coupons/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_VIEW),
  validateRequest({ params: promotionsValidation.idParam }),
  getCouponById,
)
router.post(
  '/coupons',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({ body: promotionsValidation.createCouponBody }),
  createCoupon,
)
router.put(
  '/coupons/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({
    params: promotionsValidation.idParam,
    body: promotionsValidation.updateCouponBody,
  }),
  updateCoupon,
)
router.patch(
  '/coupons/:id/toggle',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({ params: promotionsValidation.idParam }),
  toggleCoupon,
)
router.delete(
  '/coupons/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({ params: promotionsValidation.idParam }),
  deleteCoupon,
)

router.get('/flash-sales/active', getActiveFlashSales)
router.get(
  '/flash-sales',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_VIEW),
  listFlashSales,
)
router.post(
  '/flash-sales',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({ body: promotionsValidation.createFlashSaleBody }),
  createFlashSale,
)
router.put(
  '/flash-sales/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({
    params: promotionsValidation.idParam,
    body: promotionsValidation.updateFlashSaleBody,
  }),
  updateFlashSale,
)
router.patch(
  '/flash-sales/:id/toggle',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({ params: promotionsValidation.idParam }),
  toggleFlashSale,
)
router.delete(
  '/flash-sales/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.PROMOTIONS_MANAGE),
  validateRequest({ params: promotionsValidation.idParam }),
  deleteFlashSale,
)

export const promotionsRouter = router
