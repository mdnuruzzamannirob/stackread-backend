const Plan = require('../models/Plan')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')

// ─── GET /onboarding/plans ────────────────────────────────────────────────────

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ is_active: true }).sort({ sort_order: 1 })
    return sendSuccess(res, plans, 'OK')
  } catch (err) {
    next(err)
  }
}

// ─── POST /onboarding/select ──────────────────────────────────────────────────

exports.selectPlan = async (req, res, next) => {
  try {
    const { plan_id, billing_cycle = 'monthly' } = req.body

    const plan = await Plan.findOne({ _id: plan_id, is_active: true })
    if (!plan) return sendError(res, 'Plan not found.', 404)

    if (plan.is_free) {
      // Free plan: activate directly, no payment needed
      await User.findByIdAndUpdate(req.user._id, {
        current_plan_id: plan._id,
        subscription_status: 'free',
        onboarding_completed: true,
      })

      return sendSuccess(
        res,
        { payment_required: false, redirect: '/dashboard' },
        'Free plan activated.',
      )
    }

    // Paid plan: return payment initiation signal (wired in Phase 5)
    return sendSuccess(
      res,
      {
        payment_required: true,
        plan_id: plan._id,
        plan_name: plan.name,
        billing_cycle,
        amount:
          billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly,
        currency: plan.currency,
        redirect: '/onboarding/payment', // frontend handles redirect to payment flow
      },
      'Proceed to payment.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── POST /onboarding/complete ────────────────────────────────────────────────

exports.completeOnboarding = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { onboarding_completed: true })
    return sendSuccess(res, null, 'Onboarding completed.')
  } catch (err) {
    next(err)
  }
}
