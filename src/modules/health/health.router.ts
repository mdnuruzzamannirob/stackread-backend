import { Router } from 'express'

import { validateRequest } from '../../common/middlewares/validateRequest'
import { getHealth, getLiveness, getReadiness } from './health.controller'
import { healthValidation } from './health.validation'

const router = Router()

router.get('/', validateRequest({ query: healthValidation.query }), getHealth)
router.get('/live', getLiveness)
router.get('/ready', getReadiness)

export const healthRouter = router
