import { Router } from 'express'

import { healthRouter } from '../modules/health'

const router = Router()

router.use('/health', healthRouter)

export const appRouter = router
