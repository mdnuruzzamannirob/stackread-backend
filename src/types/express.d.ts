import type { ZodTypeAny } from 'zod'

declare global {
  namespace Express {
    interface Request {
      id: string
      validated?: {
        body?: unknown
        query?: unknown
        params?: unknown
      }
    }
  }
}

export type RequestSchemas = {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

export {}
