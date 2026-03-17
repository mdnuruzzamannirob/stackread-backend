import { AppError } from './AppError'

export const handleDuplicateError = (error: {
  keyValue?: Record<string, unknown>
}): AppError => {
  const duplicateField = Object.keys(error.keyValue ?? {})[0] ?? 'field'
  const duplicateValue = error.keyValue?.[duplicateField]

  return new AppError(
    `${duplicateField} already exists: ${String(duplicateValue)}`,
    409,
  )
}
