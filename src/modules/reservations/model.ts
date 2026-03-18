import { model, Schema, type Model } from 'mongoose'

import type { IReservation, ReservationStatus } from './interface'

const reservationSchema = new Schema<IReservation>(
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
    status: {
      type: String,
      enum: [
        'queued',
        'claimable',
        'claimed',
        'cancelled',
        'expired',
        'fulfilled',
      ] satisfies ReservationStatus[],
      required: true,
      default: 'queued',
      index: true,
    },
    queuePosition: {
      type: Number,
      required: false,
      default: undefined,
      min: 1,
      index: true,
    },
    claimExpiresAt: {
      type: Date,
      required: false,
      default: undefined,
      index: true,
    },
    claimedAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    fulfilledAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    cancelledAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    cancelReason: {
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

reservationSchema.index({ userId: 1, bookId: 1, status: 1 })
reservationSchema.index({
  bookId: 1,
  status: 1,
  queuePosition: 1,
  createdAt: 1,
})

export const ReservationModel: Model<IReservation> = model<IReservation>(
  'Reservation',
  reservationSchema,
)
