import type { Types } from 'mongoose'

export interface IWishlist {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
