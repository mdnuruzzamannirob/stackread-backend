import Stripe from 'stripe'

import { logger } from '../config/logger'
import { PlanModel } from '../modules/plans/model'

type StripeSyncPlanInput = {
  code: string
  name: string
  description: string
  price: number
  currency: string
}

const STRIPE_LOOKUP_KEY_PREFIX = 'stackread_plan'

const getStripeClient = (): Stripe | null => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    logger.warn(
      'Skipping Stripe plan sync because STRIPE_SECRET_KEY is missing.',
    )
    return null
  }

  return new Stripe(stripeSecretKey)
}

const buildLookupKey = (plan: StripeSyncPlanInput): string => {
  return [
    STRIPE_LOOKUP_KEY_PREFIX,
    plan.code.toLowerCase(),
    'monthly',
    plan.currency.toLowerCase(),
    String(Math.round(plan.price * 100)),
  ].join('_')
}

const resolveOrCreateProduct = async (
  stripe: Stripe,
  plan: StripeSyncPlanInput,
  existingProductId?: string,
): Promise<string> => {
  if (existingProductId) {
    try {
      const product = await stripe.products.retrieve(existingProductId)
      if (!('deleted' in product && product.deleted)) {
        return product.id
      }
    } catch {
      // Product ID may be stale; recreate below.
    }
  }

  const created = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    active: true,
    metadata: {
      planCode: plan.code,
      source: 'stackread-seed',
    },
  })

  return created.id
}

const resolveOrCreatePrice = async (
  stripe: Stripe,
  plan: StripeSyncPlanInput,
  productId: string,
): Promise<string> => {
  const lookupKey = buildLookupKey(plan)

  const byLookup = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })

  const existingByLookup = byLookup.data[0]
  if (existingByLookup) {
    return existingByLookup.id
  }

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  })

  const matching = prices.data.find((price) => {
    return (
      price.currency.toLowerCase() === plan.currency.toLowerCase() &&
      (price.unit_amount ?? -1) === Math.round(plan.price * 100) &&
      price.recurring?.interval === 'month'
    )
  })

  if (matching) {
    if ((matching.lookup_key ?? '') !== lookupKey) {
      await stripe.prices.update(matching.id, {
        lookup_key: lookupKey,
      })
    }

    return matching.id
  }

  const created = await stripe.prices.create({
    product: productId,
    currency: plan.currency.toLowerCase(),
    unit_amount: Math.max(0, Math.round(plan.price * 100)),
    recurring: {
      interval: 'month',
    },
    lookup_key: lookupKey,
    metadata: {
      planCode: plan.code,
      source: 'stackread-seed',
    },
  })

  return created.id
}

export const syncPlanCatalogWithStripe = async (
  plans: StripeSyncPlanInput[],
): Promise<void> => {
  const stripe = getStripeClient()

  if (!stripe) {
    return
  }

  for (const plan of plans) {
    const existingPlan = await PlanModel.findOne({ code: plan.code })

    const productId = await resolveOrCreateProduct(
      stripe,
      plan,
      existingPlan?.stripeProductId,
    )

    const priceId = await resolveOrCreatePrice(stripe, plan, productId)

    await PlanModel.updateOne(
      { code: plan.code },
      {
        $set: {
          stripeProductId: productId,
          stripePriceId: priceId,
        },
      },
    )

    logger.info('Stripe plan synchronized.', {
      code: plan.code,
      stripeProductId: productId,
      stripePriceId: priceId,
    })
  }
}

export const syncExistingPlansWithStripe = async (): Promise<void> => {
  const plans = await PlanModel.find({ isActive: true })
    .select('code name description price currency')
    .lean()

  await syncPlanCatalogWithStripe(
    plans.map((plan) => ({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
    })),
  )
}
