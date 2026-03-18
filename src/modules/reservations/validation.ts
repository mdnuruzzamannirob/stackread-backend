import { z } from 'zod'

import { idParamSchema, paginationSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

export const reservationsValidation = {
  idParam: idParamSchema,
  query: paginationSchema.extend({
    status: z
      .enum([
        'queued',
        'claimable',
        'claimed',
        'cancelled',
        'expired',
        'fulfilled',
      ])
      .optional(),
    userId: objectIdString.optional(),
    bookId: objectIdString.optional(),
  }),
  createBody: z.object({
    bookId: objectIdString,
  }),
  staffUpdateBody: z
    .object({
      status: z
        .enum([
          'queued',
          'claimable',
          'claimed',
          'cancelled',
          'expired',
          'fulfilled',
        ])
        .optional(),
      claimExpiresAt: z.coerce.date().optional(),
      cancelReason: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update',
    }),
}
