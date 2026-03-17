const express = require('express')
const authRoutes = require('./auth.routes')
const onboardingRoutes = require('./onboarding.routes')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/onboarding', onboardingRoutes)

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running.',
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
