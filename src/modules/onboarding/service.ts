import { AppError } from '../../common/errors/AppError'
import { paymentsService } from '../payments/service'
import { PlanModel } from '../plans/model'
import { SubscriptionModel } from '../subscriptions/model'
import { subscriptionsService } from '../subscriptions/service'
import { OnboardingModel } from './model'

const getPlanOptions = async () => {
  const plans = await PlanModel.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean()

  return plans.map((plan) => ({
    code: plan.code,
    name: plan.name,
    price: plan.price,
    currency: plan.currency,
    billingCycle: 'monthly',
    isPaid: !plan.isFree,
  }))
}

const selectPlan = async (userId: string, planCode: string) => {
  const selectedPlan = await PlanModel.findOne({
    code: planCode.toUpperCase(),
    isActive: true,
  })

  if (!selectedPlan) {
    throw new AppError('Requested plan does not exist.', 404)
  }

  const onboarding = await OnboardingModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        selectedPlanCode: selectedPlan.code,
        selectedPlanName: selectedPlan.name,
        selectedPlanPrice: selectedPlan.price,
        selectedAt: new Date(),
        status: selectedPlan.isFree ? 'completed' : 'selected',
      },
    },
    { upsert: true, new: true },
  )

  if (selectedPlan.isFree) {
    await subscriptionsService.createSubscription({
      userId,
      planId: selectedPlan._id.toString(),
      autoRenew: false,
    })

    onboarding.status = 'completed'
    onboarding.completedAt = new Date()
    await onboarding.save()

    return {
      id: onboarding._id.toString(),
      plan: {
        code: selectedPlan.code,
        name: selectedPlan.name,
        price: selectedPlan.price,
        currency: selectedPlan.currency,
        isPaid: false,
      },
      status: onboarding.status,
      nextStep: 'onboarding_completed',
    }
  }

  const payment = await paymentsService.initiatePayment({
    userId,
    planId: selectedPlan._id.toString(),
    gateway: 'stripe',
    autoRenew: true,
  })

  return {
    id: onboarding._id.toString(),
    plan: {
      code: selectedPlan.code,
      name: selectedPlan.name,
      price: selectedPlan.price,
      currency: selectedPlan.currency,
      isPaid: true,
    },
    status: onboarding.status,
    nextStep: 'redirect_to_payment',
    checkout_url: payment.checkout_url,
    paymentId: payment.payment.id,
  }
}

const completeOnboarding = async (userId: string) => {
  const onboarding = await OnboardingModel.findOne({ userId })

  if (!onboarding || !onboarding.selectedPlanCode) {
    throw new AppError(
      'Plan must be selected before onboarding completion.',
      400,
    )
  }

  const selectedPlan = await PlanModel.findOne({
    code: onboarding.selectedPlanCode,
  })

  if (!selectedPlan) {
    throw new AppError('Selected plan not found.', 404)
  }

  if (!selectedPlan.isFree) {
    const activeSubscription = await SubscriptionModel.findOne({
      userId,
      planId: selectedPlan._id,
      status: 'active',
    })

    if (!activeSubscription) {
      throw new AppError(
        'Paid plan onboarding cannot be completed before successful payment.',
        400,
      )
    }
  }

  onboarding.status = 'completed'
  onboarding.completedAt = new Date()
  await onboarding.save()

  return {
    id: onboarding._id.toString(),
    status: onboarding.status,
    completedAt: onboarding.completedAt.toISOString(),
    selectedPlanCode: onboarding.selectedPlanCode,
  }
}

const getOnboardingStatus = async (userId: string) => {
  const onboarding = await OnboardingModel.findOne({ userId })

  if (!onboarding) {
    return {
      status: 'pending',
    }
  }

  return {
    status: onboarding.status,
    selectedPlanCode: onboarding.selectedPlanCode,
    completedAt: onboarding.completedAt?.toISOString(),
  }
}

export const onboardingService = {
  getPlanOptions,
  selectPlan,
  completeOnboarding,
  getOnboardingStatus,
}
