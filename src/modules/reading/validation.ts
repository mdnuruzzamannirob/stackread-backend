import { z } from 'zod'

import { paginationSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

const bookParamSchema = z.object({
  bookId: objectIdString,
})

const nestedIdParamSchema = z.object({
  bookId: objectIdString,
  id: objectIdString,
})

export const readingValidation = {
  paginationQuery: paginationSchema,
  bookParam: bookParamSchema,
  nestedIdParam: nestedIdParamSchema,
  startReadingBody: z.object({
    currentFileId: objectIdString.optional(),
    currentPage: z.coerce.number().int().min(1).optional(),
  }),
  createSessionBody: z.object({
    fileId: objectIdString.optional(),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
    progressDelta: z.coerce.number().min(0).max(100).default(0),
    device: z.string().trim().min(2).max(120).optional(),
  }),
  updateProgressBody: z.object({
    currentFileId: objectIdString.optional(),
    currentPage: z.coerce.number().int().min(1).optional(),
    progressPercentage: z.coerce.number().min(0).max(100),
    status: z.enum(['currently-reading', 'completed']).optional(),
  }),
  createBookmarkBody: z.object({
    fileId: objectIdString.optional(),
    location: z.string().trim().min(1).max(300),
    page: z.coerce.number().int().min(1).optional(),
    note: z.string().trim().min(1).max(1000).optional(),
  }),
  updateBookmarkBody: z
    .object({
      fileId: objectIdString.optional(),
      location: z.string().trim().min(1).max(300).optional(),
      page: z.coerce.number().int().min(1).optional(),
      note: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update',
    }),
  createHighlightBody: z
    .object({
      fileId: objectIdString.optional(),
      startOffset: z.coerce.number().int().min(0),
      endOffset: z.coerce.number().int().min(1),
      selectedText: z.string().trim().min(1).max(2000),
      color: z.string().trim().min(2).max(40).default('yellow'),
      note: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((value) => value.endOffset > value.startOffset, {
      message: 'endOffset must be greater than startOffset',
      path: ['endOffset'],
    }),
  updateHighlightBody: z
    .object({
      fileId: objectIdString.optional(),
      startOffset: z.coerce.number().int().min(0).optional(),
      endOffset: z.coerce.number().int().min(1).optional(),
      selectedText: z.string().trim().min(1).max(2000).optional(),
      color: z.string().trim().min(2).max(40).optional(),
      note: z.string().trim().min(1).max(1000).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field is required for update',
    })
    .refine(
      (value) => {
        if (
          typeof value.startOffset === 'number' &&
          typeof value.endOffset === 'number'
        ) {
          return value.endOffset > value.startOffset
        }

        return true
      },
      {
        message: 'endOffset must be greater than startOffset',
        path: ['endOffset'],
      },
    ),
}
