import { connectToDatabase, disconnectFromDatabase } from '../config/db'
import { logger } from '../config/logger'
import { migration20260318Phase9Hardening } from '../migrations/20260318-phase9-hardening'

const migrations: Array<{ name: string; run: () => Promise<void> }> = [
  {
    name: '20260318-phase9-hardening',
    run: migration20260318Phase9Hardening,
  },
]

export const runMigrations = async () => {
  for (const migration of migrations) {
    logger.info('Running migration', { migration: migration.name })
    await migration.run()
    logger.info('Migration completed', { migration: migration.name })
  }
}

if (require.main === module) {
  void (async () => {
    try {
      await connectToDatabase()
      await runMigrations()
      await disconnectFromDatabase()
      process.exit(0)
    } catch (error) {
      logger.error('Migration execution failed.', {
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
