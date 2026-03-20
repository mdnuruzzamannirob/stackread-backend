import { Router } from 'express'

import { PERMISSIONS } from '../../common/constants/permissions'
import { authenticateStaff } from '../../common/middlewares/auth'
import { requirePermission } from '../../common/middlewares/requirePermission'
import { validateRequest } from '../../common/middlewares/validateRequest'
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from './controller'
import { categoriesValidation } from './validation'

const router = Router()

router.get(
  '/',
  validateRequest({ query: categoriesValidation.query }),
  listCategories,
)
router.get(
  '/:id',
  validateRequest({ params: categoriesValidation.idParam }),
  getCategoryById,
)

router.post(
  '/',
  authenticateStaff,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  validateRequest({ body: categoriesValidation.createBody }),
  createCategory,
)
router.put(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  validateRequest({
    params: categoriesValidation.idParam,
    body: categoriesValidation.updateBody,
  }),
  updateCategory,
)
router.delete(
  '/:id',
  authenticateStaff,
  requirePermission(PERMISSIONS.CATEGORIES_MANAGE),
  validateRequest({ params: categoriesValidation.idParam }),
  deleteCategory,
)

export const categoriesRouter = router
