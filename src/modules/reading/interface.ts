import type { Types } from 'mongoose'

export type ReadingStatus = 'currently-reading' | 'completed'

export interface IReadingProgress {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  currentFileId: Types.ObjectId | undefined
  currentPage: number | undefined
  progressPercentage: number
  status: ReadingStatus
  startedAt: Date
  lastReadAt: Date
  completedAt: Date | undefined
  createdAt: Date
  updatedAt: Date
}

export interface IReadingSession {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  fileId: Types.ObjectId | undefined
  startedAt: Date
  endedAt: Date
  durationSeconds: number
  progressDelta: number
  device: string | undefined
  createdAt: Date
  updatedAt: Date
}

export interface IBookmark {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  fileId: Types.ObjectId | undefined
  location: string
  page: number | undefined
  note: string | undefined
  createdAt: Date
  updatedAt: Date
}

export interface IHighlight {
  _id: Types.ObjectId
  userId: Types.ObjectId
  bookId: Types.ObjectId
  fileId: Types.ObjectId | undefined
  startOffset: number
  endOffset: number
  selectedText: string
  color: string
  note: string | undefined
  createdAt: Date
  updatedAt: Date
}
