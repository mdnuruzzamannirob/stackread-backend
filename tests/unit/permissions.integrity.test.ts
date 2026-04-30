import { beforeEach, describe, expect, it } from 'vitest'
import { ALL_PERMISSIONS } from '../../src/common/constants/permissions'
import { PermissionModel } from '../../src/modules/rbac/model'
import { seedPermissions } from '../../src/seeds/permissions.seed'

// Extend this pattern when new action types are added
const FORMAT_PATTERN = /^[a-z]+\.(manage|view|refund|export)$/

beforeEach(async () => {
  await seedPermissions()
})

describe('Permission Integrity', () => {
  it('ALL_PERMISSIONS has no duplicates', () => {
    const unique = new Set(ALL_PERMISSIONS)
    expect(unique.size).toBe(ALL_PERMISSIONS.length)
  })

  it('all strings follow <module>.<action> format', () => {
    for (const p of ALL_PERMISSIONS) {
      expect(p).toMatch(FORMAT_PATTERN)
    }
  })

  it('all strings are lowercase', () => {
    for (const p of ALL_PERMISSIONS) {
      expect(p).toBe(p.toLowerCase())
    }
  })

  it('every permission in ALL_PERMISSIONS exists in DB', async () => {
    const dbKeys = (await PermissionModel.find().select('key -_id').lean()).map(
      (p: any) => p.key,
    )
    for (const p of ALL_PERMISSIONS) {
      expect(dbKeys).toContain(p)
    }
  })

  it('DB has no permissions outside ALL_PERMISSIONS', async () => {
    const dbKeys = (await PermissionModel.find().select('key -_id').lean()).map(
      (p: any) => p.key,
    )
    for (const key of dbKeys) {
      expect(ALL_PERMISSIONS).toContain(key)
    }
  })

  it('seeding twice does not create duplicates', async () => {
    await seedPermissions()
    const count = await PermissionModel.countDocuments()
    expect(count).toBe(ALL_PERMISSIONS.length)
  })
})
