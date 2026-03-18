import { model, Schema, type Model } from 'mongoose'

import type { BorrowStatus, IBorrow } from './interface'

const borrowSchema = new Schema<IBorrow>(
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
    bookFileId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: undefined,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'borrowed',
        'returned',
        'overdue',
        'cancelled',
      ] satisfies BorrowStatus[],
      required: true,
      default: 'borrowed',
      index: true,
    },
    borrowedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    dueAt: {
      type: Date,
      required: true,
      index: true,
    },
    returnedAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    returnNote: {
      type: String,
      required: false,
      trim: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

borrowSchema.index({ userId: 1, status: 1, borrowedAt: -1 })
borrowSchema.index({ bookId: 1, status: 1, dueAt: 1 })

export const BorrowModel: Model<IBorrow> = model<IBorrow>(
  'Borrow',
  borrowSchema,
)
