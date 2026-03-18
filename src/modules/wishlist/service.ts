import { Types } from 'mongoose'

import { AppError } from '../../common/errors/AppError'
import {
  createPaginationMeta,
  getPaginationState,
} from '../../common/utils/pagination'
import { BookModel } from '../books/model'
import type { IWishlist } from './interface'
import { WishlistModel } from './model'

const ensureBookExists = async (bookId: string) => {
  const book = await BookModel.findById(bookId)

  if (!book) {
    throw new AppError('Book not found.', 404)
  }

  return book
}

const formatWishlistItem = (item: IWishlist | null) => {
  if (!item) {
    throw new AppError('Wishlist item not found.', 404)
  }

  return {
    id: item._id.toString(),
    userId: item.userId.toString(),
    bookId: item.bookId.toString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export const wishlistService = {
  getMyWishlist: async (
    userId: string,
    query: {
      page?: number
      limit?: number
    },
  ) => {
    const pagination = getPaginationState(query)
    const filter = {
      userId: new Types.ObjectId(userId),
    }

    const [rows, total] = await Promise.all([
      WishlistModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      WishlistModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatWishlistItem(row)),
    }
  },

  addToWishlist: async (userId: string, bookId: string) => {
    await ensureBookExists(bookId)

    const existing = await WishlistModel.findOne({ userId, bookId })

    if (existing) {
      return formatWishlistItem(existing)
    }

    const item = await WishlistModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
    })

    return formatWishlistItem(item)
  },

  removeFromWishlist: async (userId: string, bookId: string) => {
    const item = await WishlistModel.findOne({ userId, bookId })

    if (!item) {
      return
    }

    await item.deleteOne()
  },
}
