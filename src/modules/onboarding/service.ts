import { AppError } from '../../common/errors/AppError'
import { paymentsService } from '../payments/service'
import { PlanModel } from '../plans/model'
import { SubscriptionModel } from '../subscriptions/model'
import { subscriptionsService } from '../subscriptions/service'
import { OnboardingModel } from './model'

const getCurrentPlanContext = async (userId: string) => {
  const onboarding = await OnboardingModel.findOne({ userId })
  const currentSubscription = await SubscriptionModel.findOne({
    userId,
    status: { $in: ['active', 'pending'] },
  })
    .sort({ createdAt: -1 })
    .lean()

  const selectedPlan = onboarding?.selectedPlanCode
    ? await PlanModel.findOne({
        code: onboarding.selectedPlanCode,
        isActive: true,
      }).lean()
    : null

  return {
    onboarding,
    currentSubscription,
    selectedPlan,
  }
}

const markOnboardingCompleted = async (userId: string) => {
  const existing = await OnboardingModel.findOne({ userId })

  if (existing?.status === 'completed' && existing.completedAt) {
    return existing
  }

  const onboarding = await OnboardingModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        status: 'completed',
        completedAt: new Date(),
      },
    },
    { new: true, upsert: true },
  )

  return onboarding
}

const getPlanOptions = async (userId: string) => {
  void userId

  const plans = await PlanModel.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean()

  return plans.map((plan) => {
    return {
      id: plan._id.toString(),
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      maxDevices: plan.maxDevices,
      downloadEnabled: plan.downloadEnabled,
      accessLevel: plan.accessLevel,
      features: plan.features,
      isFree: plan.isFree,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    }
  })
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
    const subscription = await subscriptionsService.createSubscription({
      userId,
      planId: selectedPlan._id.toString(),
      autoRenew: false,
    })

    await markOnboardingCompleted(userId)

    return {
      id: onboarding._id.toString(),
      success: true,
      subscriptionCreated: true,
      subscriptionId: subscription.id,
      selectedPlanCode: selectedPlan.code,
      status: 'completed',
    }
  }

  const pendingSubscription =
    await subscriptionsService.createPendingSubscriptionForPlan({
      userId,
      planId: selectedPlan._id.toString(),
      autoRenew: true,
    })

  return {
    id: onboarding._id.toString(),
    success: true,
    subscriptionCreated: false,
    subscriptionId: pendingSubscription._id.toString(),
    selectedPlanCode: selectedPlan.code,
    status: onboarding.status,
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

  const completedOnboarding = await markOnboardingCompleted(userId)

  return {
    id: completedOnboarding._id.toString(),
    status: completedOnboarding.status,
    completedAt:
      completedOnboarding.completedAt?.toISOString() ??
      new Date().toISOString(),
    selectedPlanCode: completedOnboarding.selectedPlanCode,
  }
}

const confirmPayment = async (
  userId: string,
  sessionId: string,
  reference?: string,
) => {
  const onboarding = await OnboardingModel.findOne({ userId })

  if (!onboarding || !onboarding.selectedPlanCode) {
    throw new AppError('No selected onboarding plan found.', 400)
  }

  const selectedPlan = await PlanModel.findOne({
    code: onboarding.selectedPlanCode,
    isActive: true,
  })

  if (!selectedPlan) {
    throw new AppError('Selected onboarding plan not found.', 404)
  }

  if (selectedPlan.isFree) {
    await markOnboardingCompleted(userId)
    return {
      status: 'completed',
      selectedPlanCode: onboarding.selectedPlanCode,
      completedAt: new Date().toISOString(),
    }
  }

  await paymentsService.confirmStripeCheckoutSessionForUser({
    userId,
    sessionId,
    ...(reference ? { reference } : {}),
  })

  return getOnboardingStatus(userId)
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

const storeInterests = async (
  userId: string,
  interests: string[],
): Promise<{ success: boolean; interests: string[] }> => {
  const onboarding = await OnboardingModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        interests,
      },
    },
    { upsert: true, new: true },
  )

  return {
    success: true,
    interests: onboarding.interests ?? [],
  }
}

const storeLanguage = async (
  userId: string,
  language: string,
): Promise<{ success: boolean; language: string }> => {
  const onboarding = await OnboardingModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        selectedLanguage: language,
      },
    },
    { upsert: true, new: true },
  )

  return {
    success: true,
    language: onboarding.selectedLanguage ?? language,
  }
}

export const onboardingService = {
  getPlanOptions,
  selectPlan,
  completeOnboarding,
  confirmPayment,
  getOnboardingStatus,
  markOnboardingCompleted,
  storeInterests,
  storeLanguage,
}
