import { z } from 'zod'

import { paginationSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

export const wishlistValidation = {
  query: paginationSchema,
  bookIdParam: z.object({
    bookId: objectIdString,
  }),
}
