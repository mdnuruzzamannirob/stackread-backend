import { ALL_PERMISSIONS } from '../common/constants/permissions'
import { logger } from '../config/logger'
import { PermissionModel } from '../modules/rbac/model'

/**
 * Seeds all permissions from the PERMISSIONS constant.
 * Uses find + create pattern for clarity and auditability.
 * Idempotent — safe to run multiple times.
 */
export const seedPermissions = async (): Promise<void> => {
  let created = 0
  let skipped = 0

  for (const key of ALL_PERMISSIONS) {
    const normalizedKey = key.toLowerCase()
    const existing = await PermissionModel.findOne({ key: normalizedKey })

    if (!existing) {
      await PermissionModel.create({
        key: normalizedKey,
        name: normalizedKey,
        description: `Permission for ${normalizedKey}`,
        module: normalizedKey.split('.')[0],
      })
      created++
    } else {
      skipped++
    }
  }

  logger.info(`Permissions seeded — created: ${created}, skipped: ${skipped}`)
}
