import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { readingService } from './service'

const getUserId = (request: Parameters<RequestHandler>[0]): string => {
  if (!request.auth || request.auth.type !== 'user') {
    throw new AppError('User authentication is required.', 401)
  }

  return request.auth.sub
}

const getBookId = (request: Parameters<RequestHandler>[0]): string => {
  const bookId = request.params.bookId

  if (typeof bookId !== 'string') {
    throw new AppError('Invalid book id parameter.', 400)
  }

  return bookId
}

const getEntityId = (request: Parameters<RequestHandler>[0]): string => {
  const id = request.params.id

  if (typeof id !== 'string') {
    throw new AppError('Invalid id parameter.', 400)
  }

  return id
}

export const startReading: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.startReading(
      getUserId(request),
      getBookId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Reading started successfully.',
      data,
    })
  },
)

export const createReadingSession: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.createReadingSession(
      getUserId(request),
      getBookId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Reading session saved successfully.',
      data,
    })
  },
)

export const updateReadingProgress: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.updateReadingProgress(
      getUserId(request),
      getBookId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Reading progress updated successfully.',
      data,
    })
  },
)

export const getReadingHistory: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await readingService.getReadingHistory(
      getUserId(request),
      request.query as { page?: number; limit?: number },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Reading history retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const getCurrentlyReading: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await readingService.getCurrentlyReading(
      getUserId(request),
      request.query as { page?: number; limit?: number },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Currently reading list retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const getCompletedReading: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await readingService.getCompletedReading(
      getUserId(request),
      request.query as { page?: number; limit?: number },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Completed reading list retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const listBookmarks: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.listBookmarks(
      getUserId(request),
      getBookId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Bookmarks retrieved successfully.',
      data,
    })
  },
)

export const createBookmark: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.createBookmark(
      getUserId(request),
      getBookId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Bookmark created successfully.',
      data,
    })
  },
)

export const updateBookmark: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.updateBookmark(
      getUserId(request),
      getBookId(request),
      getEntityId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Bookmark updated successfully.',
      data,
    })
  },
)

export const deleteBookmark: RequestHandler = catchAsync(
  async (request, response) => {
    await readingService.deleteBookmark(
      getUserId(request),
      getBookId(request),
      getEntityId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Bookmark deleted successfully.',
      data: null,
    })
  },
)

export const listHighlights: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.listHighlights(
      getUserId(request),
      getBookId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Highlights retrieved successfully.',
      data,
    })
  },
)

export const createHighlight: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.createHighlight(
      getUserId(request),
      getBookId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Highlight created successfully.',
      data,
    })
  },
)

export const updateHighlight: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await readingService.updateHighlight(
      getUserId(request),
      getBookId(request),
      getEntityId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Highlight updated successfully.',
      data,
    })
  },
)

export const deleteHighlight: RequestHandler = catchAsync(
  async (request, response) => {
    await readingService.deleteHighlight(
      getUserId(request),
      getBookId(request),
      getEntityId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Highlight deleted successfully.',
      data: null,
    })
  },
)
