import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { subscriptionsService } from './service'

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

export const getMyCurrentSubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.getMyCurrentSubscription(
      getUserId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Current subscription retrieved successfully.',
      data,
    })
  },
)

export const getMySubscriptionHistory: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.getMySubscriptionHistory(
      getUserId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription history retrieved successfully.',
      data,
    })
  },
)

export const listSubscriptions: RequestHandler = catchAsync(
  async (_request, response) => {
    const data = await subscriptionsService.listSubscriptions()

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscriptions retrieved successfully.',
      data,
    })
  },
)

export const getSubscriptionById: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.getSubscriptionById(
      getIdParam(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription retrieved successfully.',
      data,
    })
  },
)

export const createSubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.createSubscription(request.body)

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Subscription created successfully.',
      data,
    })
  },
)

export const cancelMySubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.cancelMySubscription(
      getUserId(request),
      request.body.reason,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription cancelled successfully.',
      data,
    })
  },
)

export const renewMySubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.renewMySubscription(
      getUserId(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription renewed successfully.',
      data,
    })
  },
)

export const upgradeMySubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.changePlanWithTransaction({
      userId: getUserId(request),
      newPlanId: request.body.newPlanId,
      mode: 'upgrade',
    })

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription upgrade started successfully.',
      data,
    })
  },
)

export const downgradeMySubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.changePlanWithTransaction({
      userId: getUserId(request),
      newPlanId: request.body.newPlanId,
      mode: 'downgrade',
    })

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription downgrade started successfully.',
      data,
    })
  },
)

export const adminUpdateSubscription: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await subscriptionsService.adminUpdateSubscription(
      getIdParam(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Subscription updated successfully.',
      data,
    })
  },
)
