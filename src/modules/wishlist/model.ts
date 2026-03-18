import { model, Schema, type Model } from 'mongoose'

import type { IWishlist } from './interface'

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

wishlistSchema.index({ userId: 1, bookId: 1 }, { unique: true })
wishlistSchema.index({ userId: 1, createdAt: -1 })

export const WishlistModel: Model<IWishlist> = model<IWishlist>(
  'Wishlist',
  wishlistSchema,
)
