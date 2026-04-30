import { hashWithScrypt } from '../common/utils/crypto'
import { config } from '../config'
import { connectToDatabase, disconnectFromDatabase } from '../config/db'
import { logger } from '../config/logger'
import { rbacService } from '../modules/rbac'
import { StaffModel } from '../modules/staff/model'

export const seedSuperAdmin = async (): Promise<void> => {
  await rbacService.ensurePermissionSeed()

  const existingSuperAdmin = await StaffModel.findOne({ isSuperAdmin: true })

  if (existingSuperAdmin) {
    logger.info('Super Admin already exists — skipping seed')
    return
  }

  const email = config.superAdmin.email.toLowerCase()
  const password = config.superAdmin.password
  const name = config.superAdmin.name

  const passwordHash = await hashWithScrypt(password)

  await StaffModel.findOneAndUpdate(
    { isSuperAdmin: true },
    {
      $setOnInsert: {
        name,
        email,
        passwordHash,
        isSuperAdmin: true,
        isActive: true,
        twoFactor: { enabled: false },
      },
    },
    {
      upsert: true,
      new: true,
    },
  )

  logger.info('Super Admin seeded successfully')
}

if (require.main === module) {
  void (async () => {
    try {
      await connectToDatabase()
      await seedSuperAdmin()
      logger.info('Super admin seed completed successfully.')
      await disconnectFromDatabase()
      process.exit(0)
    } catch (error) {
      logger.error('Super admin seed failed.', {
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
