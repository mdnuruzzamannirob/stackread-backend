import { model, Schema, type Model } from 'mongoose'

import type { IReview } from './interface'

const reviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      default: undefined,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true })
reviewSchema.index({ bookId: 1, isVisible: 1, createdAt: -1 })

export const ReviewModel: Model<IReview> = model<IReview>(
  'Review',
  reviewSchema,
)
