import { describe, expect, it } from 'vitest'

import { paymentsService } from '../../src/modules/payments/service'
import { SubscriptionModel } from '../../src/modules/subscriptions/model'
import { createPayment } from '../fixtures/factories'

describe('Payments integration flow', () => {
  it('verifies payment and activates subscription', async () => {
    const payment = await createPayment()

    const verified = await paymentsService.verifyPayment({
      reference: payment.reference,
      providerPaymentId: 'provider-txn-1',
      status: 'success',
    })

    expect(verified.status).toBe('success')

    const subscription = await SubscriptionModel.findById(
      payment.subscriptionId,
    )
    expect(subscription?.status).toBe('active')
  })
})
