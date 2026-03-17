import { AppError } from './AppError'

export const handleCastError = (error: {
  path?: string
  value?: unknown
}): AppError => {
  const field = error.path ?? 'resource'
  return new AppError(`Invalid ${field}: ${String(error.value)}`, 400)
}
