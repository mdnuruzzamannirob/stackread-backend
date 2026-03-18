import { describe, expect, it } from 'vitest'

import { borrowsService } from '../../src/modules/borrows/service'
import { SubscriptionModel } from '../../src/modules/subscriptions/model'
import { createBook, createPlan, createUser } from '../fixtures/factories'

describe('Borrows integration flow', () => {
  it('borrows and returns a book', async () => {
    const user = await createUser()
    const plan = await createPlan({ maxBorrows: 2 })
    const book = await createBook()

    await SubscriptionModel.create({
      userId: user._id,
      planId: plan._id,
      status: 'active',
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      autoRenew: true,
    })

    const borrowed = await borrowsService.borrowBook(user._id.toString(), {
      bookId: book._id.toString(),
    })

    expect(borrowed.status).toBe('borrowed')

    const returned = await borrowsService.returnBorrow(
      user._id.toString(),
      borrowed.id,
      {
        note: 'Returned in good condition',
      },
    )

    expect(returned.status).toBe('returned')
  })
})
