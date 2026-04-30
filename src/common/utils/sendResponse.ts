import type { Response } from 'express'

import type { ApiResponse, Meta } from '../interfaces/apiResponse'

interface SendResponseOptions<T> {
  statusCode: number
  success: boolean
  message: string
  data: T
  meta?: Meta
}

export const sendResponse = <T>(
  response: Response,
  payload: SendResponseOptions<T>,
): Response<ApiResponse<T>> => {
  const body: ApiResponse<T> = {
    success: payload.success,
    message: payload.message,
    data: payload.data,
  }

  if (payload.meta) {
    body.meta = payload.meta
  }

  return response.status(payload.statusCode).json(body)
}
