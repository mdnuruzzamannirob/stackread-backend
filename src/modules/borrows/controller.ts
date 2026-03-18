import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { borrowsService } from './service'

const getUserId = (request: Parameters<RequestHandler>[0]): string => {
  if (!request.auth || request.auth.type !== 'user') {
    throw new AppError('User authentication is required.', 401)
  }

  return request.auth.sub
}

const getIdParam = (request: Parameters<RequestHandler>[0]): string => {
  const id = request.params.id

  if (typeof id !== 'string') {
    throw new AppError('Invalid id parameter.', 400)
  }

  return id
}

export const getMyBorrows: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await borrowsService.getMyBorrows(
      getUserId(request),
      request.query as {
        page?: number
        limit?: number
        status?: 'borrowed' | 'returned' | 'overdue' | 'cancelled'
      },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'My borrows retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const createBorrow: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await borrowsService.borrowBook(
      getUserId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Book borrowed successfully.',
      data,
    })
  },
)

export const returnBorrow: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await borrowsService.returnBorrow(
      getUserId(request),
      getIdParam(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Borrow returned successfully.',
      data,
    })
  },
)

export const listBorrows: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await borrowsService.listBorrows(
      request.query as {
        page?: number
        limit?: number
        status?: 'borrowed' | 'returned' | 'overdue' | 'cancelled'
        userId?: string
        bookId?: string
      },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Borrows retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const staffUpdateBorrow: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await borrowsService.staffUpdateBorrow(
      getIdParam(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Borrow updated successfully.',
      data,
    })
  },
)
