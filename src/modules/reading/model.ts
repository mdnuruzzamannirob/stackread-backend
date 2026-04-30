import { model, Schema, type Model } from 'mongoose'

import type {
  IBookmark,
  IHighlight,
  IReadingProgress,
  IReadingSession,
  ReadingStatus,
} from './interface'

const readingProgressSchema = new Schema<IReadingProgress>(
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
    currentFileId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: undefined,
    },
    currentPage: {
      type: Number,
      required: false,
      min: 1,
      default: undefined,
    },
    progressPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['currently-reading', 'completed'] satisfies ReadingStatus[],
      required: true,
      default: 'currently-reading',
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastReadAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true })
readingProgressSchema.index({ userId: 1, status: 1, lastReadAt: -1 })

const readingSessionSchema = new Schema<IReadingSession>(
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
    fileId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: undefined,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    progressDelta: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    device: {
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

readingSessionSchema.index({ userId: 1, bookId: 1, createdAt: -1 })

const bookmarkSchema = new Schema<IBookmark>(
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
    fileId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: undefined,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    page: {
      type: Number,
      required: false,
      min: 1,
      default: undefined,
    },
    note: {
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

bookmarkSchema.index({ userId: 1, bookId: 1, location: 1 }, { unique: true })

const highlightSchema = new Schema<IHighlight>(
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
    fileId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: undefined,
    },
    startOffset: {
      type: Number,
      required: true,
      min: 0,
    },
    endOffset: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedText: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      default: 'yellow',
    },
    note: {
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

highlightSchema.index({ userId: 1, bookId: 1, createdAt: -1 })

export const ReadingProgressModel: Model<IReadingProgress> =
  model<IReadingProgress>('ReadingProgress', readingProgressSchema)

export const ReadingSessionModel: Model<IReadingSession> =
  model<IReadingSession>('ReadingSession', readingSessionSchema)

export const BookmarkModel: Model<IBookmark> = model<IBookmark>(
  'Bookmark',
  bookmarkSchema,
)

export const HighlightModel: Model<IHighlight> = model<IHighlight>(
  'Highlight',
  highlightSchema,
)
