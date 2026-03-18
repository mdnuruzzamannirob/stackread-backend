import type { Types } from 'mongoose'

export interface IReview {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  rating: number
  title: string | undefined
  comment: string
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}
