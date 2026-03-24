import { AppError } from '../errors/AppError'

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const sanitizeRequiredText = (
  value: string,
  fieldName: string,
  minLength = 1,
) => {
  const sanitized = stripHtml(value)

  if (sanitized.length < minLength) {
    throw new AppError(`${fieldName} is invalid after sanitization.`, 400)
  }

  return sanitized
}

export const sanitizeOptionalText = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return value
  }

  const sanitized = stripHtml(value)
  return sanitized.length > 0 ? sanitized : null
}

export const sanitizeTags = (tags: string[]) => [
  ...new Set(tags.map((tag) => stripHtml(tag).toLowerCase()).filter(Boolean)),
]
