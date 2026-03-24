import type { RequestHandler } from 'express'

import { catchAsync } from '../../common/utils/catchAsync'
import {
  getFileIdParam,
  getIdParam,
  getStaffId,
} from '../../common/utils/getParam'
import { sendResponse } from '../../common/utils/sendResponse'
import type {
  AddBookFilePayload,
  BooksListQuery,
  BulkImportBooksPayload,
  CreateBookPayload,
  SetBookAvailabilityPayload,
  SetBookStatusPayload,
  ToggleBookFeaturedPayload,
  UpdateBookPayload,
} from './interface'
import { booksService } from './service'

export const listPublicBooks: RequestHandler = catchAsync(
  async (request, response) => {
    const query = request.query as BooksListQuery

    const result = await booksService.listPublicBooks(query)

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Books retrieved successfully.',
      data: result.data,
      meta: result.meta,
    })
  },
)

export const listFeaturedBooks: RequestHandler = catchAsync(
  async (_request, response) => {
    const data = await booksService.listFeaturedBooks()

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Featured books retrieved successfully.',
      data,
    })
  },
)

export const getPublicBookById: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.getPublicBookById(getIdParam(request))

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book retrieved successfully.',
      data,
    })
  },
)

export const getBookPreview: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.getBookPreview(getIdParam(request))

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book preview retrieved successfully.',
      data,
    })
  },
)

export const getBookReviewSummary: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.getBookReviewSummary(getIdParam(request))

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book review summary retrieved successfully.',
      data,
    })
  },
)

export const createBook: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.createBook(
      getStaffId(request),
      request.body as CreateBookPayload,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Book created successfully.',
      data,
    })
  },
)

export const updateBook: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.updateBook(
      getIdParam(request),
      request.body as UpdateBookPayload,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book updated successfully.',
      data,
    })
  },
)

export const deleteBook: RequestHandler = catchAsync(
  async (request, response) => {
    await booksService.deleteBook(getIdParam(request))

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book deleted successfully.',
      data: null,
    })
  },
)

export const setBookFeatured: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.setBookFeatured(
      getIdParam(request),
      (request.body as ToggleBookFeaturedPayload).featured,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book featured status updated successfully.',
      data,
    })
  },
)

export const setBookStatus: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.setBookStatus(
      getIdParam(request),
      (request.body as SetBookStatusPayload).status,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book status updated successfully.',
      data,
    })
  },
)

export const setBookAvailability: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.setBookAvailability(
      getIdParam(request),
      (request.body as SetBookAvailabilityPayload).availabilityStatus,
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book availability updated successfully.',
      data,
    })
  },
)

export const addBookFile: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.addBookFile(
      getIdParam(request),
      request.body as AddBookFilePayload,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Book file metadata saved successfully.',
      data,
    })
  },
)

export const deleteBookFile: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.deleteBookFile(
      getIdParam(request),
      getFileIdParam(request),
    )

    sendResponse(response, {
      statusCode: 200,
      success: true,
      message: 'Book file removed successfully.',
      data,
    })
  },
)

export const bulkImportBooks: RequestHandler = catchAsync(
  async (request, response) => {
    const data = await booksService.bulkImportBooks(
      getStaffId(request),
      request.body as BulkImportBooksPayload,
    )

    sendResponse(response, {
      statusCode: 201,
      success: true,
      message: 'Book import processed successfully.',
      data,
    })
  },
)
