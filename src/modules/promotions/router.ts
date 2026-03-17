import { Router } from 'express'

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
  requirePermission('promotions.view'),
  listCoupons,
)
router.get(
  '/coupons/:id',
  authenticateStaff,
  requirePermission('promotions.view'),
  validateRequest({ params: promotionsValidation.idParam }),
  getCouponById,
)
router.post(
  '/coupons',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({ body: promotionsValidation.createCouponBody }),
  createCoupon,
)
router.put(
  '/coupons/:id',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({
    params: promotionsValidation.idParam,
    body: promotionsValidation.updateCouponBody,
  }),
  updateCoupon,
)
router.patch(
  '/coupons/:id/toggle',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({ params: promotionsValidation.idParam }),
  toggleCoupon,
)
router.delete(
  '/coupons/:id',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({ params: promotionsValidation.idParam }),
  deleteCoupon,
)

router.get('/flash-sales/active', getActiveFlashSales)
router.get(
  '/flash-sales',
  authenticateStaff,
  requirePermission('promotions.view'),
  listFlashSales,
)
router.post(
  '/flash-sales',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({ body: promotionsValidation.createFlashSaleBody }),
  createFlashSale,
)
router.put(
  '/flash-sales/:id',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({
    params: promotionsValidation.idParam,
    body: promotionsValidation.updateFlashSaleBody,
  }),
  updateFlashSale,
)
router.patch(
  '/flash-sales/:id/toggle',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({ params: promotionsValidation.idParam }),
  toggleFlashSale,
)
router.delete(
  '/flash-sales/:id',
  authenticateStaff,
  requirePermission('promotions.manage'),
  validateRequest({ params: promotionsValidation.idParam }),
  deleteFlashSale,
)

export const promotionsRouter = router
