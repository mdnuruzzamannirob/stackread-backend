import { Types } from 'mongoose'

import { AppError } from '../../common/errors/AppError'
import {
  createPaginationMeta,
  getPaginationState,
} from '../../common/utils/pagination'
import { BookModel } from '../books/model'
import type {
  IBookmark,
  IHighlight,
  IReadingProgress,
  IReadingSession,
} from './interface'
import {
  BookmarkModel,
  HighlightModel,
  ReadingProgressModel,
  ReadingSessionModel,
} from './model'

const ensureBookReadable = async (bookId: string) => {
  const book = await BookModel.findOne({ _id: bookId, isAvailable: true })

  if (!book) {
    throw new AppError('Book not found or unavailable.', 404)
  }

  return book
}

const formatReadingProgress = (progress: IReadingProgress | null) => {
  if (!progress) {
    throw new AppError('Reading progress not found.', 404)
  }

  return {
    id: progress._id.toString(),
    userId: progress.userId.toString(),
    bookId: progress.bookId.toString(),
    currentFileId: progress.currentFileId?.toString(),
    currentPage: progress.currentPage,
    progressPercentage: progress.progressPercentage,
    status: progress.status,
    startedAt: progress.startedAt.toISOString(),
    lastReadAt: progress.lastReadAt.toISOString(),
    completedAt: progress.completedAt?.toISOString(),
    createdAt: progress.createdAt.toISOString(),
    updatedAt: progress.updatedAt.toISOString(),
  }
}

const formatSession = (session: IReadingSession | null) => {
  if (!session) {
    throw new AppError('Reading session not found.', 404)
  }

  return {
    id: session._id.toString(),
    userId: session.userId.toString(),
    bookId: session.bookId.toString(),
    fileId: session.fileId?.toString(),
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    progressDelta: session.progressDelta,
    device: session.device,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  }
}

const formatBookmark = (bookmark: IBookmark | null) => {
  if (!bookmark) {
    throw new AppError('Bookmark not found.', 404)
  }

  return {
    id: bookmark._id.toString(),
    userId: bookmark.userId.toString(),
    bookId: bookmark.bookId.toString(),
    fileId: bookmark.fileId?.toString(),
    location: bookmark.location,
    page: bookmark.page,
    note: bookmark.note,
    createdAt: bookmark.createdAt.toISOString(),
    updatedAt: bookmark.updatedAt.toISOString(),
  }
}

const formatHighlight = (highlight: IHighlight | null) => {
  if (!highlight) {
    throw new AppError('Highlight not found.', 404)
  }

  return {
    id: highlight._id.toString(),
    userId: highlight.userId.toString(),
    bookId: highlight.bookId.toString(),
    fileId: highlight.fileId?.toString(),
    startOffset: highlight.startOffset,
    endOffset: highlight.endOffset,
    selectedText: highlight.selectedText,
    color: highlight.color,
    note: highlight.note,
    createdAt: highlight.createdAt.toISOString(),
    updatedAt: highlight.updatedAt.toISOString(),
  }
}

const getOrCreateProgress = async (
  userId: string,
  bookId: string,
  payload?: {
    currentFileId?: string
    currentPage?: number
  },
) => {
  const existing = await ReadingProgressModel.findOne({ userId, bookId })

  if (existing) {
    existing.lastReadAt = new Date()

    if (payload?.currentFileId) {
      existing.currentFileId = new Types.ObjectId(payload.currentFileId)
    }

    if (typeof payload?.currentPage === 'number') {
      existing.currentPage = payload.currentPage
    }

    await existing.save()
    return existing
  }

  return ReadingProgressModel.create({
    userId: new Types.ObjectId(userId),
    bookId: new Types.ObjectId(bookId),
    currentFileId: payload?.currentFileId
      ? new Types.ObjectId(payload.currentFileId)
      : undefined,
    currentPage: payload?.currentPage,
    progressPercentage: 0,
    status: 'currently-reading',
    startedAt: new Date(),
    lastReadAt: new Date(),
  })
}

export const readingService = {
  startReading: async (
    userId: string,
    bookId: string,
    payload: {
      currentFileId?: string
      currentPage?: number
    },
  ) => {
    await ensureBookReadable(bookId)
    const progress = await getOrCreateProgress(userId, bookId, payload)
    return formatReadingProgress(progress)
  },

  createReadingSession: async (
    userId: string,
    bookId: string,
    payload: {
      fileId?: string
      startedAt: Date
      endedAt: Date
      progressDelta: number
      device?: string
    },
  ) => {
    await ensureBookReadable(bookId)

    if (payload.endedAt.getTime() < payload.startedAt.getTime()) {
      throw new AppError('Session endedAt must be after startedAt.', 400)
    }

    await getOrCreateProgress(userId, bookId)

    const durationSeconds = Math.floor(
      (payload.endedAt.getTime() - payload.startedAt.getTime()) / 1000,
    )

    const session = await ReadingSessionModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
      fileId: payload.fileId ? new Types.ObjectId(payload.fileId) : undefined,
      startedAt: payload.startedAt,
      endedAt: payload.endedAt,
      durationSeconds,
      progressDelta: payload.progressDelta,
      device: payload.device,
    })

    return formatSession(session)
  },

  updateReadingProgress: async (
    userId: string,
    bookId: string,
    payload: {
      currentFileId?: string
      currentPage?: number
      progressPercentage: number
      status?: 'currently-reading' | 'completed'
    },
  ) => {
    await ensureBookReadable(bookId)

    const progress = await getOrCreateProgress(userId, bookId)

    progress.progressPercentage = payload.progressPercentage
    progress.lastReadAt = new Date()

    if (payload.currentFileId) {
      progress.currentFileId = new Types.ObjectId(payload.currentFileId)
    }

    if (typeof payload.currentPage === 'number') {
      progress.currentPage = payload.currentPage
    }

    const resolvedStatus =
      payload.status ??
      (payload.progressPercentage >= 100 ? 'completed' : 'currently-reading')

    progress.status = resolvedStatus
    progress.completedAt =
      resolvedStatus === 'completed' ? new Date() : undefined

    await progress.save()

    return formatReadingProgress(progress)
  },

  getReadingHistory: async (
    userId: string,
    query: {
      page?: number
      limit?: number
    },
  ) => {
    const pagination = getPaginationState(query)
    const filter = { userId: new Types.ObjectId(userId) }

    const [rows, total] = await Promise.all([
      ReadingProgressModel.find(filter)
        .sort({ lastReadAt: -1, updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReadingProgressModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReadingProgress(row)),
    }
  },

  getCurrentlyReading: async (
    userId: string,
    query: {
      page?: number
      limit?: number
    },
  ) => {
    const pagination = getPaginationState(query)
    const filter = {
      userId: new Types.ObjectId(userId),
      status: 'currently-reading',
    }

    const [rows, total] = await Promise.all([
      ReadingProgressModel.find(filter)
        .sort({ lastReadAt: -1, updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReadingProgressModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReadingProgress(row)),
    }
  },

  getCompletedReading: async (
    userId: string,
    query: {
      page?: number
      limit?: number
    },
  ) => {
    const pagination = getPaginationState(query)
    const filter = {
      userId: new Types.ObjectId(userId),
      status: 'completed',
    }

    const [rows, total] = await Promise.all([
      ReadingProgressModel.find(filter)
        .sort({ completedAt: -1, updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ReadingProgressModel.countDocuments(filter),
    ])

    return {
      meta: createPaginationMeta(pagination, total),
      data: rows.map((row) => formatReadingProgress(row)),
    }
  },

  listBookmarks: async (userId: string, bookId: string) => {
    await ensureBookReadable(bookId)

    const bookmarks = await BookmarkModel.find({ userId, bookId }).sort({
      createdAt: -1,
    })

    return bookmarks.map((bookmark) => formatBookmark(bookmark))
  },

  createBookmark: async (
    userId: string,
    bookId: string,
    payload: {
      fileId?: string
      location: string
      page?: number
      note?: string
    },
  ) => {
    await ensureBookReadable(bookId)

    const existing = await BookmarkModel.findOne({
      userId,
      bookId,
      location: payload.location,
    })

    if (existing) {
      throw new AppError('Bookmark already exists for this location.', 409)
    }

    const bookmark = await BookmarkModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
      fileId: payload.fileId ? new Types.ObjectId(payload.fileId) : undefined,
      location: payload.location,
      page: payload.page,
      note: payload.note,
    })

    return formatBookmark(bookmark)
  },

  updateBookmark: async (
    userId: string,
    bookId: string,
    bookmarkId: string,
    payload: Partial<{
      fileId: string
      location: string
      page: number
      note: string
    }>,
  ) => {
    await ensureBookReadable(bookId)

    const bookmark = await BookmarkModel.findOne({
      _id: bookmarkId,
      userId,
      bookId,
    })

    if (!bookmark) {
      throw new AppError('Bookmark not found.', 404)
    }

    if (typeof payload.fileId === 'string') {
      bookmark.fileId = new Types.ObjectId(payload.fileId)
    }

    if (typeof payload.location === 'string') {
      bookmark.location = payload.location
    }

    if (typeof payload.page === 'number') {
      bookmark.page = payload.page
    }

    if (typeof payload.note === 'string') {
      bookmark.note = payload.note
    }

    await bookmark.save()

    return formatBookmark(bookmark)
  },

  deleteBookmark: async (
    userId: string,
    bookId: string,
    bookmarkId: string,
  ) => {
    await ensureBookReadable(bookId)

    const bookmark = await BookmarkModel.findOne({
      _id: bookmarkId,
      userId,
      bookId,
    })

    if (!bookmark) {
      throw new AppError('Bookmark not found.', 404)
    }

    await bookmark.deleteOne()
  },

  listHighlights: async (userId: string, bookId: string) => {
    await ensureBookReadable(bookId)

    const highlights = await HighlightModel.find({ userId, bookId }).sort({
      createdAt: -1,
    })

    return highlights.map((highlight) => formatHighlight(highlight))
  },

  createHighlight: async (
    userId: string,
    bookId: string,
    payload: {
      fileId?: string
      startOffset: number
      endOffset: number
      selectedText: string
      color: string
      note?: string
    },
  ) => {
    await ensureBookReadable(bookId)

    if (payload.endOffset <= payload.startOffset) {
      throw new AppError('endOffset must be greater than startOffset.', 400)
    }

    const highlight = await HighlightModel.create({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(bookId),
      fileId: payload.fileId ? new Types.ObjectId(payload.fileId) : undefined,
      startOffset: payload.startOffset,
      endOffset: payload.endOffset,
      selectedText: payload.selectedText,
      color: payload.color,
      note: payload.note,
    })

    return formatHighlight(highlight)
  },

  updateHighlight: async (
    userId: string,
    bookId: string,
    highlightId: string,
    payload: Partial<{
      fileId: string
      startOffset: number
      endOffset: number
      selectedText: string
      color: string
      note: string
    }>,
  ) => {
    await ensureBookReadable(bookId)

    const highlight = await HighlightModel.findOne({
      _id: highlightId,
      userId,
      bookId,
    })

    if (!highlight) {
      throw new AppError('Highlight not found.', 404)
    }

    const nextStartOffset = payload.startOffset ?? highlight.startOffset
    const nextEndOffset = payload.endOffset ?? highlight.endOffset

    if (nextEndOffset <= nextStartOffset) {
      throw new AppError('endOffset must be greater than startOffset.', 400)
    }

    if (typeof payload.fileId === 'string') {
      highlight.fileId = new Types.ObjectId(payload.fileId)
    }

    if (typeof payload.startOffset === 'number') {
      highlight.startOffset = payload.startOffset
    }

    if (typeof payload.endOffset === 'number') {
      highlight.endOffset = payload.endOffset
    }

    if (typeof payload.selectedText === 'string') {
      highlight.selectedText = payload.selectedText
    }

    if (typeof payload.color === 'string') {
      highlight.color = payload.color
    }

    if (typeof payload.note === 'string') {
      highlight.note = payload.note
    }

    await highlight.save()

    return formatHighlight(highlight)
  },

  deleteHighlight: async (
    userId: string,
    bookId: string,
    highlightId: string,
  ) => {
    await ensureBookReadable(bookId)

    const highlight = await HighlightModel.findOne({
      _id: highlightId,
      userId,
      bookId,
    })

    if (!highlight) {
      throw new AppError('Highlight not found.', 404)
    }

    await highlight.deleteOne()
  },
}
