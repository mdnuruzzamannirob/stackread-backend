import { describe, expect, it, vi } from 'vitest'

import { executeWithRetry } from '../../../src/workers/retry.util'

describe('Background retry policy', () => {
  it('retries failed handler until success', async () => {
    let count = 0

    const handler = vi.fn(async () => {
      count += 1
      if (count < 3) {
        throw new Error('temporary failure')
      }
    })

    await executeWithRetry('test-worker', handler, {
      maxAttempts: 3,
      backoffMs: 1,
    })

    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('throws after max attempts', async () => {
    const handler = vi.fn(async () => {
      throw new Error('always failing')
    })

    await expect(
      executeWithRetry('failing-worker', handler, {
        maxAttempts: 2,
        backoffMs: 1,
      }),
    ).rejects.toThrow('always failing')

    expect(handler).toHaveBeenCalledTimes(2)
  })
})
