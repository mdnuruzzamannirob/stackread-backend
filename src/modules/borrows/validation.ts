import { z } from 'zod'

import { idParamSchema, paginationSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

export const borrowsValidation = {
  idParam: idParamSchema,
  query: paginationSchema.extend({
    status: z.enum(['borrowed', 'returned', 'overdue', 'cancelled']).optional(),
    userId: objectIdString.optional(),
    bookId: objectIdString.optional(),
  }),
  createBody: z.object({
    bookId: objectIdString,
    bookFileId: objectIdString.optional(),
    dueAt: z.coerce.date().optional(),
  }),
  returnBody: z.object({
    note: z.string().trim().min(1).max(1000).optional(),
  }),
  staffUpdateBody: z
    .object({
      status: z
        .enum(['borrowed', 'returned', 'overdue', 'cancelled'])
        .optional(),
      dueAt: z.coerce.date().optional(),
      returnNote: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update',
    }),
}
