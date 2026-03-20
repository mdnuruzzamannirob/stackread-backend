import mongoose from 'mongoose'

import { env } from '../config/env'
import { rbacService } from '../modules/rbac/service'
import { seedPlans } from './plans.seed'
import { seedSettings } from './settings.seed'
import { seedSuperAdmin } from './superAdmin.seed'

export const runSeeds = async (): Promise<void> => {
  await mongoose.connect(env.mongodbUri)

  try {
    await rbacService.ensurePermissionSeed()
    await seedPlans()
    await seedSettings()
    await seedSuperAdmin()
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  void runSeeds().catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
}
