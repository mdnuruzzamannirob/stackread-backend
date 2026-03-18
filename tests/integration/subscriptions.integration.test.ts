import { describe, expect, it } from 'vitest'

import { subscriptionsService } from '../../src/modules/subscriptions/service'
import { createPlan, createUser } from '../fixtures/factories'

describe('Subscriptions integration flow', () => {
  it('creates and renews subscription', async () => {
    const user = await createUser()
    const plan = await createPlan({ isFree: true, price: 0 })

    const created = await subscriptionsService.createSubscription({
      userId: user._id.toString(),
      planId: plan._id.toString(),
      autoRenew: true,
    })

    expect(created.userId).toBe(user._id.toString())
    expect(created.planId).toBe(plan._id.toString())

    const renewed = await subscriptionsService.renewMySubscription(
      user._id.toString(),
    )

    expect(renewed.id).toBe(created.id)
    expect(new Date(renewed.endsAt).getTime()).toBeGreaterThan(
      new Date(created.endsAt).getTime(),
    )
  })
})
