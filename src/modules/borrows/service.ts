import { Types } from 'mongoose'

import { AppError } from '../../common/errors/AppError'
import {
  createPaginationMeta,
  getPaginationState,
} from '../../common/utils/pagination'
import { BookModel } from '../books/model'
import { PlanModel } from '../plans/model'
import { SubscriptionModel } from '../subscriptions/model'
import type { IBorrow } from './interface'
import { BorrowModel } from './model'

const DEFAULT_BORROW_DAYS = 14

const formatBorrow = (borrow: IBorrow | null) => {
  if (!borrow) {
    throw new AppError('Borrow not found.', 404)
  }

  return {
    id: borrow._id.toString(),
    userId: borrow.userId.toString(),
    bookId: borrow.bookId.toString(),
    bookFileId: borrow.bookFileId?.toString(),
    planId: borrow.planId.toString(),
    status: borrow.status,
    borrowedAt: borrow.borrowedAt.toISOString(),
    dueAt: borrow.dueAt.toISOString(),
    returnedAt: borrow.returnedAt?.toISOString(),
    returnNote: borrow.returnNote,
    createdAt: borrow.createdAt.toISOString(),
    updatedAt: borrow.updatedAt.toISOString(),
  }
}

const ensureBookBorrowable = async (bookId: string) => {
  const book = await BookModel.findOne({ _id: bookId, isAvailable: true })

  if (!book) {
    throw new AppError('Book not found or unavailable for borrow.', 404)
  }

  return book
}

const ensureActivePlanAndBorrowLimit = async (userId: string) => {
  const now = new Date()
  const subscription = await SubscriptionModel.findOne({
    userId,
    status: 'active',
    endsAt: { $gte: now },
  })

  if (!subscription) {
    throw new AppError(
      'An active subscription is required to borrow books.',
      400,
    )
  }

  const plan = await PlanModel.findById(subscription.planId)

  if (!plan || !plan.isActive) {
    throw new AppError('Active subscription plan not found or inactive.', 400)
  }

  const activeBorrowCount = await BorrowModel.countDocuments({
    userId,
    status: { $in: ['borrowed', 'overdue'] },
  })

  if (activeBorrowCount >= plan.maxBorrows) {
    throw new AppError(
      'Borrow limit reached for your active subscription plan.',
      400,
    )
  }

  return {
    plan,
    subscription,
  }
}

const expireOverdueBorrowsForUser = async (userId: string) => {
  const now = new Date()

  await BorrowModel.updateMany(
    {
      userId,
      status: 'borrowed',
      dueAt: { $lt: now },
    },
    {
      $set: { status: 'overdue' },
    },
  )
}

export const borrowsService = {
  getMyBorrows: async (
    userId: string,
    query: {
      page?: number
      limit?: number
      status?: 'borrowed' | 'returned' | 'overdue' | 'cancelled'
    },
  ) => {
    await expireOverdueBorrowsForUser(userId)

    const pagination = getPaginationState(query)
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    }

    if (query.status) {
      filter.status = query.status
    }

    const [rows, total] = await Promise.all([
      BorrowModel.find(filter)
        .sort({ borrowedAt: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      BorrowModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatBorrow(row)),
    }
  },

  borrowBook: async (
    userId: string,
    payload: {
      bookId: string
      bookFileId?: string
      dueAt?: Date
    },
  ) => {
    await ensureBookBorrowable(payload.bookId)
    const { plan } = await ensureActivePlanAndBorrowLimit(userId)

    const existing = await BorrowModel.findOne({
      userId,
      bookId: payload.bookId,
      status: { $in: ['borrowed', 'overdue'] },
    })

    if (existing) {
      throw new AppError('This book is already borrowed by the user.', 409)
    }

    const now = new Date()
    const dueAt =
      payload.dueAt && payload.dueAt.getTime() > now.getTime()
        ? payload.dueAt
        : new Date(now.getTime() + DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000)

    const borrow = await BorrowModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(payload.bookId),
      bookFileId: payload.bookFileId
        ? new Types.ObjectId(payload.bookFileId)
        : undefined,
      planId: plan._id,
      status: 'borrowed',
      borrowedAt: now,
      dueAt,
    })

    return formatBorrow(borrow)
  },

  returnBorrow: async (
    userId: string,
    borrowId: string,
    payload: {
      note?: string
    },
  ) => {
    const borrow = await BorrowModel.findOne({ _id: borrowId, userId })

    if (!borrow) {
      throw new AppError('Borrow not found.', 404)
    }

    if (borrow.status === 'returned') {
      throw new AppError('Borrow is already returned.', 400)
    }

    if (borrow.status === 'cancelled') {
      throw new AppError('Cancelled borrow cannot be returned.', 400)
    }

    borrow.status = 'returned'
    borrow.returnedAt = new Date()
    borrow.returnNote = payload.note

    await borrow.save()

    return formatBorrow(borrow)
  },

  listBorrows: async (query: {
    page?: number
    limit?: number
    status?: 'borrowed' | 'returned' | 'overdue' | 'cancelled'
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
      BorrowModel.find(filter)
        .sort({ borrowedAt: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      BorrowModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatBorrow(row)),
    }
  },

  staffUpdateBorrow: async (
    id: string,
    payload: Partial<{
      status: 'borrowed' | 'returned' | 'overdue' | 'cancelled'
      dueAt: Date
      returnNote: string
    }>,
  ) => {
    const borrow = await BorrowModel.findById(id)

    if (!borrow) {
      throw new AppError('Borrow not found.', 404)
    }

    if (payload.dueAt) {
      borrow.dueAt = payload.dueAt
    }

    if (typeof payload.returnNote === 'string') {
      borrow.returnNote = payload.returnNote
    }

    if (payload.status) {
      borrow.status = payload.status

      if (payload.status === 'returned' && !borrow.returnedAt) {
        borrow.returnedAt = new Date()
      }

      if (payload.status !== 'returned') {
        borrow.returnedAt = undefined
      }
    }

    await borrow.save()

    return formatBorrow(borrow)
  },
}
