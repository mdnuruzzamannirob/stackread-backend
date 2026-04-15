import { logger } from '../config/logger'
import { PlanModel } from '../modules/plans/model'
import { syncExistingPlansWithStripe } from '../seeds/stripe-plan-sync'

export const migration20260415PlanStripeCatalogSync =
  async (): Promise<void> => {
    await PlanModel.collection.createIndex({ stripeProductId: 1 })
    await PlanModel.collection.createIndex({ stripePriceId: 1 })

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      logger.warn(
        'Skipping Stripe catalog backfill in migration because STRIPE_SECRET_KEY is missing.',
      )
      return
    }

    await syncExistingPlansWithStripe()
  }
