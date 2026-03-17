import type { RequestHandler } from 'express'

import { AppError } from '../../common/errors/AppError'
import { catchAsync } from '../../common/utils/catchAsync'
import { sendResponse } from '../../common/utils/sendResponse'
import { plansService } from './service'

const getIdParam = (request: Parameters<RequestHandler>[0]): string => {
  const id = request.params.id

  if (typeof id !== 'string') {
    throw new AppError('Invalid id parameter.', 400)
  }

  return id
}

export const listPlans: RequestHandler = catchAsync(
  async (request, response) => {
    const includeInactive =
      typeof request.query.includeInactive === 'boolean'
        ? request.query.includeInactive
        : false

    const data = await plansService.listPlans(includeInactive)

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Plans retrieved successfully.',
      data,
    })
  },
)

export const getPlanById: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await plansService.getPlanById(getIdParam(request))

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Plan retrieved successfully.',
      data,
    })
  },
)

export const createPlan: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await plansService.createPlan(request.body)

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Plan created successfully.',
      data,
    })
  },
)

export const updatePlan: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await plansService.updatePlan(
      getIdParam(request),
      request.body,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Plan updated successfully.',
      data,
    })
  },
)

export const togglePlan: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await plansService.togglePlan(getIdParam(request))

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Plan status updated successfully.',
      data,
    })
  },
)
