import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { wishlistService } from './service'

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

export const getMyWishlist: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await wishlistService.getMyWishlist(
      getUserId(request),
      request.query as { page?: number; limit?: number },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Wishlist retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const addToWishlist: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await wishlistService.addToWishlist(
      getUserId(request),
      getBookId(request),
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Book added to wishlist successfully.',
      data,
    })
  },
)

export const removeFromWishlist: RequestHandler = catchAsync(
  async (request, response) => {
    await wishlistService.removeFromWishlist(
      getUserId(request),
      getBookId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book removed from wishlist successfully.',
      data: null,
    })
  },
)
