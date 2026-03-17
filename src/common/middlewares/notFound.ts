import type { RequestHandler } from 'express'

import { AppError } from '../errors/AppError'

export const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(`Route not found: ${request.originalUrl}`, 404))
}
