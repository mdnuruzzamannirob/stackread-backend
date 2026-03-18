import type { Types } from 'mongoose'

export type ReservationStatus =
  | 'queued'
  | 'claimable'
  | 'claimed'
  | 'cancelled'
  | 'expired'
  | 'fulfilled'

export interface IReservation {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  status: ReservationStatus
  queuePosition: number | undefined
  claimExpiresAt: Date | undefined
  claimedAt: Date | undefined
  fulfilledAt: Date | undefined
  cancelledAt: Date | undefined
  cancelReason: string | undefined
  createdAt: Date
  updatedAt: Date
}
