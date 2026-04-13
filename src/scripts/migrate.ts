import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { connectToDatabase, disconnectFromDatabase } from '../config/db'
import { logger } from '../config/logger'
type Migration = { name: string; run: () => Promise<void> }

const projectRoot = process.cwd()
const migrationsDir = path.join(projectRoot, 'src', 'migrations')

const isMigrationFile = (fileName: string): boolean =>
  fileName.endsWith('.ts') && !fileName.endsWith('.d.ts')

const resolveMigrationRunner = (mod: Record<string, unknown>) => {
  const named = Object.entries(mod).find(
    ([key, value]) =>
      key.startsWith('migration') && typeof value === 'function',
  )
  if (named) return named[1] as () => Promise<void>

  if (typeof mod.default === 'function')
    return mod.default as () => Promise<void>

  return undefined
}

const loadMigrations = async (): Promise<Migration[]> => {
  if (!fs.existsSync(migrationsDir)) {
    logger.warn('Migrations directory not found.', { migrationsDir })
    return []
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(isMigrationFile)
    .sort((a, b) => a.localeCompare(b))

  const loaded = await Promise.all(
    migrationFiles.map(async (fileName) => {
      const absPath = path.join(migrationsDir, fileName)
      const mod = (await import(pathToFileURL(absPath).href)) as Record<
        string,
        unknown
      >
      const run = resolveMigrationRunner(mod)
      if (!run) {
        logger.warn('Skipping migration file without executable export.', {
          file: fileName,
        })
        return undefined
      }

      return {
        name: path.basename(fileName, '.ts'),
        run,
      }
    }),
  )

  return loaded.filter((migration): migration is Migration => !!migration)
}

export const runMigrations = async () => {
  const migrations = await loadMigrations()
  if (!migrations.length) {
    logger.info('No migrations found to run.')
    return
  }

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
