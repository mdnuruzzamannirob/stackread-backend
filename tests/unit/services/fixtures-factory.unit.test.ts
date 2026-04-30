import { describe, expect, it } from 'vitest'

import * as factories from '../../fixtures/factories'

describe('Model factories', () => {
  it('creates fixtures for all model factories', async () => {
    const created = await Promise.all([
      factories.createPermission(),
      factories.createRole(),
      factories.createUser(),
      factories.createStaff(),
      factories.createPlan(),
      factories.createSubscription(),
      factories.createAuthor(),
      factories.createCategory(),
      factories.createBook(),
      factories.createReadingProgress(),
      factories.createBorrow(),
      factories.createReservation(),
      factories.createWishlist(),
      factories.createReview(),
      factories.createNotification(),
      factories.createSearchLog(),
      factories.createPayment(),
      factories.createCoupon(),
      factories.createFlashSale(),
      factories.createOnboarding(),
      factories.createAuditLog(),
      factories.createReportJob(),
      factories.createSettings(),
    ])

    expect(created.length).toBe(23)
  })
})
