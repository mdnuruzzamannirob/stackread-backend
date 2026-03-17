const express = require('express')
const onboardingController = require('../controllers/onboarding.controller')
const { authenticateUser } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { selectPlanRules } = require('../validators/onboarding.validator')

const router = express.Router()

// GET /onboarding/plans — Public: list active subscription plans
router.get('/plans', onboardingController.getPlans)

// POST /onboarding/select — Authenticated: choose a plan after registration
router.post(
  '/select',
  authenticateUser,
  validate(selectPlanRules),
  onboardingController.selectPlan,
)

// POST /onboarding/complete — Authenticated: mark onboarding as done
router.post(
  '/complete',
  authenticateUser,
  onboardingController.completeOnboarding,
)

module.exports = router
