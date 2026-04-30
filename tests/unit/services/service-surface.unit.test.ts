import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const servicesRoot = path.resolve(process.cwd(), 'src/modules')

const collectServiceFiles = (dir: string): string[] => {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const item of items) {
    const itemPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...collectServiceFiles(itemPath))
      continue
    }

    if (item.isFile() && item.name === 'service.ts') {
      files.push(itemPath)
    }
  }

  return files
}

describe('Service layer surface', () => {
  it('exposes callable service functions for every module service file', async () => {
    const serviceFiles = collectServiceFiles(servicesRoot)

    expect(serviceFiles.length).toBeGreaterThan(0)

    for (const filePath of serviceFiles) {
      const relative = path
        .relative(process.cwd(), filePath)
        .replace(/\\/g, '/')
      const imported = (await import(path.resolve(filePath))) as Record<
        string,
        unknown
      >

      const serviceEntries = Object.entries(imported).filter(
        ([key, value]) =>
          key.endsWith('Service') && value && typeof value === 'object',
      )

      expect(
        serviceEntries.length,
        `${relative} should export at least one service object`,
      ).toBeGreaterThan(0)

      for (const [, serviceValue] of serviceEntries) {
        const functionNames = Object.entries(
          serviceValue as Record<string, unknown>,
        )
          .filter(([, fn]) => typeof fn === 'function')
          .map(([name]) => name)

        expect(
          functionNames.length,
          `${relative} should contain service functions`,
        ).toBeGreaterThan(0)
      }
    }
  })
})
