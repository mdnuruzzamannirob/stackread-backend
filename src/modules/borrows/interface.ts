import type { Types } from 'mongoose'

export type BorrowStatus = 'borrowed' | 'returned' | 'overdue' | 'cancelled'

export interface IBorrow {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  bookFileId: Types.ObjectId | undefined
  planId: Types.ObjectId
  status: BorrowStatus
  borrowedAt: Date
  dueAt: Date
  returnedAt: Date | undefined
  returnNote: string | undefined
  createdAt: Date
  updatedAt: Date
}
