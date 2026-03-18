import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { reviewsService } from './service'

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

const getIdParam = (request: Parameters<RequestHandler>[0]): string => {
  const id = request.params.id

  if (typeof id !== 'string') {
    throw new AppError('Invalid id parameter.', 400)
  }

  return id
}

export const createReview: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await reviewsService.createReview(
      getUserId(request),
      getBookId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Review created successfully.',
      data,
    })
  },
)

export const updateReview: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await reviewsService.updateReview(
      getUserId(request),
      getBookId(request),
      getIdParam(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Review updated successfully.',
      data,
    })
  },
)

export const deleteReview: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await reviewsService.deleteReview(
      getUserId(request),
      getBookId(request),
      getIdParam(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Review deleted successfully.',
      data,
    })
  },
)

export const listPublicBookReviews: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await reviewsService.listPublicBookReviews(
      getBookId(request),
      request.query as { page?: number; limit?: number },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book reviews retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const listReviewsForAdmin: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await reviewsService.listReviewsForAdmin(
      request.query as {
        page?: number
        limit?: number
        bookId?: string
        userId?: string
        isVisible?: boolean
      },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Reviews retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const toggleReviewVisibility: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await reviewsService.setReviewVisibility(
      getIdParam(request),
      request.body.isVisible,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Review visibility updated successfully.',
      data,
    })
  },
)
