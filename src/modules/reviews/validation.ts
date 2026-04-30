import { z } from 'zod'

import { idParamSchema, paginationSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

export const reviewsValidation = {
  idParam: idParamSchema,
  bookParam: z.object({
    bookId: objectIdString,
  }),
  reviewNestedParam: z.object({
    bookId: objectIdString,
    id: objectIdString,
  }),
  query: paginationSchema.extend({
    bookId: objectIdString.optional(),
    userId: objectIdString.optional(),
    isVisible: z.coerce.boolean().optional(),
  }),
  createBody: z.object({
    rating: z.coerce.number().min(1).max(5),
    title: z.string().trim().min(2).max(200).optional(),
    comment: z.string().trim().min(3).max(5000),
  }),
  updateBody: z
    .object({
      rating: z.coerce.number().min(1).max(5).optional(),
      title: z.string().trim().min(2).max(200).optional(),
      comment: z.string().trim().min(3).max(5000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update',
    }),
  toggleVisibilityBody: z.object({
    isVisible: z.boolean(),
  }),
}
