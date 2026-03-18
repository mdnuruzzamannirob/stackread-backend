import { connectToDatabase, disconnectFromDatabase } from '../config/db'
import { logger } from '../config/logger'
import { seedPermissions } from './permissions.seed'
import { seedPlans } from './plans.seed'
import { seedSettings } from './settings.seed'
import { seedSuperAdmin } from './superAdmin.seed'

export const runAllSeeds = async (): Promise<void> => {
  await seedPermissions()
  await seedPlans()
  await seedSettings()
  await seedSuperAdmin()
}

if (require.main === module) {
  void (async () => {
    try {
      await connectToDatabase()
      await runAllSeeds()
      logger.info('All seeds executed successfully.')
      await disconnectFromDatabase()
      process.exit(0)
    } catch (error) {
      logger.error('All seed execution failed.', {
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
