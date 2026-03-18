import { Router } from 'express'

import { authenticateUser } from '../../common/middlewares/auth'
import { validateRequest } from '../../common/middlewares/validateRequest'
import { addToWishlist, getMyWishlist, removeFromWishlist } from './controller'
import { wishlistValidation } from './validation'

const router = Router()

router.get(
  '/wishlist',
  authenticateUser,
  validateRequest({ query: wishlistValidation.query }),
  getMyWishlist,
)
router.post(
  '/wishlist/:bookId',
  authenticateUser,
  validateRequest({ params: wishlistValidation.bookIdParam }),
  addToWishlist,
)
router.delete(
  '/wishlist/:bookId',
  authenticateUser,
  validateRequest({ params: wishlistValidation.bookIdParam }),
  removeFromWishlist,
)

export const wishlistRouter = router
