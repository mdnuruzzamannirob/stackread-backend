import '../setup/env'

import { afterAll, afterEach, beforeAll } from 'vitest'

import { clearTestDatabase, closeTestDatabase, setupTestDatabase } from './db'

beforeAll(async () => {
  await setupTestDatabase()
})

afterEach(async () => {
  await clearTestDatabase()
})

afterAll(async () => {
  await closeTestDatabase()
})
