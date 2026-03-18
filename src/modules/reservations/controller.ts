import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { reservationsService } from './service'

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

export const listMyReservations: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await reservationsService.listMyReservations(
      getUserId(request),
      request.query as {
        page?: number
        limit?: number
        status?:
          | 'queued'
          | 'claimable'
          | 'claimed'
          | 'cancelled'
          | 'expired'
          | 'fulfilled'
      },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'My reservations retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const createReservation: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await reservationsService.createReservation(
      getUserId(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Reservation created successfully.',
      data,
    })
  },
)

export const cancelMyReservation: RequestHandler = catchAsync(
  async (request, response) => {
    await reservationsService.cancelMyReservation(
      getUserId(request),
      getIdParam(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Reservation cancelled successfully.',
      data: null,
    })
  },
)

export const listReservations: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await reservationsService.listReservations(
      request.query as {
        page?: number
        limit?: number
        status?:
          | 'queued'
          | 'claimable'
          | 'claimed'
          | 'cancelled'
          | 'expired'
          | 'fulfilled'
        userId?: string
        bookId?: string
      },
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Reservations retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const staffUpdateReservation: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await reservationsService.staffUpdateReservation(
      getIdParam(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Reservation updated successfully.',
      data,
    })
  },
)
