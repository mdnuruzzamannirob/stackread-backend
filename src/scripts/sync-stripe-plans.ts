import { connectToDatabase, disconnectFromDatabase } from '../config/db'
import { logger } from '../config/logger'
import { syncExistingPlansWithStripe } from '../seeds/stripe-plan-sync'

if (require.main === module) {
  void (async () => {
    try {
      await connectToDatabase()
      await syncExistingPlansWithStripe()
      logger.info('Stripe plan sync completed successfully.')
      await disconnectFromDatabase()
      process.exit(0)
    } catch (error) {
      logger.error('Stripe plan sync failed.', {
        error:
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error),
      })
      await disconnectFromDatabase()
      process.exit(1)
    }
  })()
}
