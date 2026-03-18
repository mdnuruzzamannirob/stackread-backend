import { Types } from 'mongoose'

import { AppError } from '../../common/errors/AppError'
import {
  createPaginationMeta,
  getPaginationState,
} from '../../common/utils/pagination'
import { BookModel } from '../books/model'
import type { IReview } from './interface'
import { ReviewModel } from './model'

const ensureBookExists = async (bookId: string) => {
  const book = await BookModel.findById(bookId)

  if (!book) {
    throw new AppError('Book not found.', 404)
  }

  return book
}

const formatReview = (review: IReview | null) => {
  if (!review) {
    throw new AppError('Review not found.', 404)
  }

  return {
    id: review._id.toString(),
    userId: review.userId.toString(),
    bookId: review.bookId.toString(),
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isVisible: review.isVisible,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }
}

const recomputeBookReviewStats = async (bookId: string) => {
  const rows: Array<{ average: number; count: number }> =
    await ReviewModel.aggregate([
      {
        $match: {
          bookId: new Types.ObjectId(bookId),
          isVisible: true,
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ])

  const row = rows[0]

  const average = row ? Number(row.average.toFixed(2)) : 0
  const count = row?.count ?? 0

  await BookModel.findByIdAndUpdate(bookId, {
    ratingAverage: average,
    ratingCount: count,
  })

  return {
    ratingAverage: average,
    ratingCount: count,
  }
}

export const reviewsService = {
  createReview: async (
    userId: string,
    bookId: string,
    payload: {
      rating: number
      title?: string
      comment: string
    },
  ) => {
    await ensureBookExists(bookId)

    const existing = await ReviewModel.findOne({ userId, bookId })

    if (existing) {
      throw new AppError('You already reviewed this book.', 409)
    }

    const review = await ReviewModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      isVisible: true,
    })

    const metrics = await recomputeBookReviewStats(bookId)

    return {
      review: formatReview(review),
      metrics,
    }
  },

  updateReview: async (
    userId: string,
    bookId: string,
    reviewId: string,
    payload: Partial<{
      rating: number
      title: string
      comment: string
    }>,
  ) => {
    await ensureBookExists(bookId)

    const review = await ReviewModel.findOne({
      _id: reviewId,
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
    })

    if (!review) {
      throw new AppError('Review not found.', 404)
    }

    if (typeof payload.rating === 'number') {
      review.rating = payload.rating
    }

    if (typeof payload.title === 'string') {
      review.title = payload.title
    }

    if (typeof payload.comment === 'string') {
      review.comment = payload.comment
    }

    await review.save()

    const metrics = await recomputeBookReviewStats(bookId)

    return {
      review: formatReview(review),
      metrics,
    }
  },

  deleteReview: async (userId: string, bookId: string, reviewId: string) => {
    await ensureBookExists(bookId)

    const review = await ReviewModel.findOne({
      _id: reviewId,
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
    })

    if (!review) {
      throw new AppError('Review not found.', 404)
    }

    await review.deleteOne()

    const metrics = await recomputeBookReviewStats(bookId)

    return {
      metrics,
    }
  },

  listPublicBookReviews: async (
    bookId: string,
    query: {
      page?: number
      limit?: number
    },
  ) => {
    await ensureBookExists(bookId)

    const pagination = getPaginationState(query)
    const filter = {
      bookId: new Types.ObjectId(bookId),
      isVisible: true,
    }

    const [rows, total] = await Promise.all([
      ReviewModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReviewModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReview(row)),
    }
  },

  listReviewsForAdmin: async (query: {
    page?: number
    limit?: number
    bookId?: string
    userId?: string
    isVisible?: boolean
  }) => {
    const pagination = getPaginationState(query)
    const filter: Record<string, unknown> = {}

    if (query.bookId) {
      filter.bookId = new Types.ObjectId(query.bookId)
    }

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId)
    }

    if (typeof query.isVisible === 'boolean') {
      filter.isVisible = query.isVisible
    }

    const [rows, total] = await Promise.all([
      ReviewModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReviewModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReview(row)),
    }
  },

  setReviewVisibility: async (reviewId: string, isVisible: boolean) => {
    const review = await ReviewModel.findById(reviewId)

    if (!review) {
      throw new AppError('Review not found.', 404)
    }

    review.isVisible = isVisible
    await review.save()

    const metrics = await recomputeBookReviewStats(review.bookId.toString())

    return {
      review: formatReview(review),
      metrics,
    }
  },
}
