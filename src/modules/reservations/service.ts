import { Types } from 'mongoose'

import { AppError } from '../../common/errors/AppError'
import {
  createPaginationMeta,
  getPaginationState,
} from '../../common/utils/pagination'
import { BookModel } from '../books/model'
import type { IReservation, ReservationStatus } from './interface'
import { ReservationModel } from './model'

const formatReservation = (reservation: IReservation | null) => {
  if (!reservation) {
    throw new AppError('Reservation not found.', 404)
  }

  const queuePosition = reservation.queuePosition
  const claimExpiresAt = reservation.claimExpiresAt?.toISOString()

  return {
    id: reservation._id.toString(),
    userId: reservation.userId.toString(),
    bookId: reservation.bookId.toString(),
    status: reservation.status,
    queuePosition,
    queue_position: queuePosition,
    claimExpiresAt,
    claim_expires_at: claimExpiresAt,
    claimedAt: reservation.claimedAt?.toISOString(),
    fulfilledAt: reservation.fulfilledAt?.toISOString(),
    cancelledAt: reservation.cancelledAt?.toISOString(),
    cancelReason: reservation.cancelReason,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  }
}

const isQueueTrackedStatus = (status: ReservationStatus) => {
  return status === 'queued' || status === 'claimable'
}

const ensureBookExists = async (bookId: string) => {
  const book = await BookModel.findById(bookId)

  if (!book) {
    throw new AppError('Book not found.', 404)
  }

  return book
}

const expireClaimableReservations = async (bookId?: string) => {
  const now = new Date()
  const filter: Record<string, unknown> = {
    status: 'claimable',
    claimExpiresAt: { $lt: now },
  }

  if (bookId) {
    filter.bookId = new Types.ObjectId(bookId)
  }

  const expired = await ReservationModel.find(filter)

  if (!expired.length) {
    return []
  }

  await Promise.all(
    expired.map(async (reservation) => {
      reservation.status = 'expired'
      reservation.claimExpiresAt = undefined
      reservation.queuePosition = undefined
      await reservation.save()
      return reservation.bookId.toString()
    }),
  )

  return [...new Set(expired.map((item) => item.bookId.toString()))]
}

const recalculateQueuePositions = async (bookId: string) => {
  const queued = await ReservationModel.find({
    bookId: new Types.ObjectId(bookId),
    status: { $in: ['queued', 'claimable'] },
  }).sort({ createdAt: 1, _id: 1 })

  await Promise.all(
    queued.map(async (reservation, index) => {
      const nextPosition = index + 1
      if (reservation.queuePosition !== nextPosition) {
        reservation.queuePosition = nextPosition
        await reservation.save()
      }
    }),
  )
}

const touchQueueForBook = async (bookId: string) => {
  await expireClaimableReservations(bookId)
  await recalculateQueuePositions(bookId)
}

export const reservationsService = {
  listMyReservations: async (
    userId: string,
    query: {
      page?: number
      limit?: number
      status?: ReservationStatus
    },
  ) => {
    const pagination = getPaginationState(query)

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    }

    if (query.status) {
      filter.status = query.status
    }

    const [rows, total] = await Promise.all([
      ReservationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReservationModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReservation(row)),
    }
  },

  createReservation: async (userId: string, payload: { bookId: string }) => {
    await ensureBookExists(payload.bookId)
    await touchQueueForBook(payload.bookId)

    const existing = await ReservationModel.findOne({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(payload.bookId),
      status: { $in: ['queued', 'claimable', 'claimed'] },
    })

    if (existing) {
      throw new AppError(
        'An active reservation already exists for this book.',
        409,
      )
    }

    const queuePosition =
      (await ReservationModel.countDocuments({
        bookId: payload.bookId,
        status: { $in: ['queued', 'claimable'] },
      })) + 1

    const reservation = await ReservationModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(payload.bookId),
      status: 'queued',
      queuePosition,
    })

    return formatReservation(reservation)
  },

  cancelMyReservation: async (userId: string, reservationId: string) => {
    const reservation = await ReservationModel.findOne({
      _id: reservationId,
      userId: new Types.ObjectId(userId),
    })

    if (!reservation) {
      throw new AppError('Reservation not found.', 404)
    }

    if (reservation.status === 'fulfilled') {
      throw new AppError('Fulfilled reservation cannot be cancelled.', 400)
    }

    if (reservation.status === 'cancelled') {
      throw new AppError('Reservation is already cancelled.', 400)
    }

    reservation.status = 'cancelled'
    reservation.cancelledAt = new Date()
    reservation.cancelReason = 'Cancelled by user'
    reservation.queuePosition = undefined
    reservation.claimExpiresAt = undefined
    await reservation.save()

    await touchQueueForBook(reservation.bookId.toString())
  },

  listReservations: async (query: {
    page?: number
    limit?: number
    status?: ReservationStatus
    userId?: string
    bookId?: string
  }) => {
    const pagination = getPaginationState(query)
    const filter: Record<string, unknown> = {}

    if (query.status) {
      filter.status = query.status
    }

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId)
    }

    if (query.bookId) {
      filter.bookId = new Types.ObjectId(query.bookId)
    }

    const [rows, total] = await Promise.all([
      ReservationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReservationModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReservation(row)),
    }
  },

  staffUpdateReservation: async (
    id: string,
    payload: Partial<{
      status: ReservationStatus
      claimExpiresAt: Date
      cancelReason: string
    }>,
  ) => {
    const reservation = await ReservationModel.findById(id)

    if (!reservation) {
      throw new AppError('Reservation not found.', 404)
    }

    if (payload.claimExpiresAt) {
      reservation.claimExpiresAt = payload.claimExpiresAt
    }

    if (typeof payload.cancelReason === 'string') {
      reservation.cancelReason = payload.cancelReason
    }

    if (payload.status) {
      reservation.status = payload.status

      if (payload.status === 'claimable') {
        reservation.claimExpiresAt =
          payload.claimExpiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      if (payload.status === 'claimed') {
        reservation.claimedAt = new Date()
        reservation.claimExpiresAt = undefined
      }

      if (payload.status === 'fulfilled') {
        reservation.fulfilledAt = new Date()
        reservation.claimExpiresAt = undefined
        reservation.queuePosition = undefined
      }

      if (payload.status === 'cancelled' || payload.status === 'expired') {
        reservation.cancelledAt =
          payload.status === 'cancelled' ? new Date() : reservation.cancelledAt
        reservation.queuePosition = undefined
        reservation.claimExpiresAt = undefined
      }

      if (!isQueueTrackedStatus(payload.status)) {
        reservation.queuePosition = undefined
      }
    }

    await reservation.save()
    await touchQueueForBook(reservation.bookId.toString())

    return formatReservation(reservation)
  },
}
