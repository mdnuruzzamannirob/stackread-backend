import { describe, expect, it } from 'vitest'

import { reservationsService } from '../../src/modules/reservations/service'
import { createBook, createUser } from '../fixtures/factories'

describe('Reservations integration flow', () => {
  it('creates and cancels reservation', async () => {
    const user = await createUser()
    const book = await createBook()

    const created = await reservationsService.createReservation(
      user._id.toString(),
      {
        bookId: book._id.toString(),
      },
    )

    expect(created.status).toBe('queued')

    await reservationsService.cancelMyReservation(
      user._id.toString(),
      created.id,
    )

    const mine = await reservationsService.listMyReservations(
      user._id.toString(),
      {
        page: 1,
        limit: 10,
      },
    )

    expect(mine.data[0]?.status).toBe('cancelled')
  })
})
