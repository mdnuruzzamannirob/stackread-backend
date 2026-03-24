import { Types } from 'mongoose'
import { AppError } from '../../common/errors/AppError'
import {
  sanitizeOptionalText,
  sanitizeRequiredText,
  sanitizeTags,
} from '../../common/utils/sanitize'
import { AuthorModel } from '../authors'
import { BookFileFormat, BookModel, IBook, UpdateBookPayload } from '../books'
import { CategoryModel } from '../categories'
import { PublisherModel } from '../publishers/model'

export const allowedBookFormats = new Set<BookFileFormat>([
  'pdf',
  'epub',
  'mobi',
  'txt',
  'azw3',
])

export const toObjectIdArray = (values: string[]) => {
  const uniqueValues = [...new Set(values)]
  return uniqueValues.map((value) => new Types.ObjectId(value))
}

export const parseBase64 = (value: string): Buffer => {
  const normalized = value.includes(',')
    ? (value.split(',').pop() ?? '')
    : value
  const buffer = Buffer.from(normalized, 'base64')

  if (buffer.byteLength === 0) {
    throw new AppError('Invalid base64 file payload.', 400)
  }

  return buffer
}

export const formatBook = (book: IBook | null) => {
  if (!book) {
    throw new AppError('Book not found.', 404)
  }

  return {
    id: book._id.toString(),
    title: book.title,
    slug: book.slug,
    isbn: book.isbn,
    summary: book.summary,
    description: book.description,
    language: book.language,
    pageCount: book.pageCount,
    publicationDate: book.publicationDate?.toISOString(),
    coverImage: book.coverImage ?? null,
    edition: book.edition,
    featured: book.featured,
    availabilityStatus: book.availabilityStatus,
    accessLevel: book.accessLevel,
    status: book.status,
    authorIds: book.authorIds.map((authorId) => authorId.toString()),
    categoryIds: book.categoryIds.map((categoryId) => categoryId.toString()),
    publisherId: book.publisherId?.toString(),
    tags: book.tags,
    files: book.files.map((file) => {
      if (!file._id) {
        throw new AppError('Book file metadata is corrupted.', 500)
      }

      return {
        id: file._id.toString(),
        provider: file.provider,
        publicId: file.publicId,
        url: file.url,
        format: file.format,
        resourceType: file.resourceType,
        size: file.size,
        originalFileName: file.originalFileName,
        uploadedAt: file.uploadedAt.toISOString(),
      }
    }),
    ratingAverage: book.ratingAverage,
    ratingCount: book.ratingCount,
    addedBy: book.addedBy.toString(),
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  }
}

export const validateAuthorAndCategoryLinks = async (
  authorIds: string[] | undefined,
  categoryIds: string[] | undefined,
) => {
  if (authorIds) {
    const uniqueAuthorIds = [...new Set(authorIds)]
    const count = await AuthorModel.countDocuments({
      _id: { $in: uniqueAuthorIds },
      isActive: true,
    })

    if (count !== uniqueAuthorIds.length) {
      throw new AppError('One or more authors are invalid or inactive.', 400)
    }
  }

  if (categoryIds) {
    const uniqueCategoryIds = [...new Set(categoryIds)]
    const count = await CategoryModel.countDocuments({
      _id: { $in: uniqueCategoryIds },
      isActive: true,
    })

    if (count !== uniqueCategoryIds.length) {
      throw new AppError('One or more categories are invalid or inactive.', 400)
    }
  }
}

export const validatePublisherLink = async (
  publisherId: string | null | undefined,
) => {
  if (!publisherId) {
    return
  }

  const publisher = await PublisherModel.findOne({
    _id: publisherId,
    isActive: true,
  })

  if (!publisher) {
    throw new AppError('Publisher is invalid or inactive.', 400)
  }
}

export const applyBookUpdates = async (
  book: IBook,
  payload: UpdateBookPayload,
) => {
  if (typeof payload.slug === 'string') {
    const existingSlug = await BookModel.findOne({
      slug: payload.slug,
      _id: { $ne: book._id },
    })

    if (existingSlug) {
      throw new AppError('Book slug already exists.', 409)
    }

    book.slug = payload.slug
  }

  if (typeof payload.isbn === 'string') {
    const existingIsbn = await BookModel.findOne({
      isbn: payload.isbn,
      _id: { $ne: book._id },
    })

    if (existingIsbn) {
      throw new AppError('Book ISBN already exists.', 409)
    }

    book.isbn = payload.isbn
  }

  if (payload.isbn === null) {
    book.isbn = null
  }

  if (typeof payload.title === 'string') {
    book.title = sanitizeRequiredText(payload.title, 'Title', 2)
  }

  if (typeof payload.summary === 'string') {
    book.summary = sanitizeRequiredText(payload.summary, 'Summary', 10)
  }

  if (typeof payload.description !== 'undefined') {
    book.description = sanitizeOptionalText(payload.description) ?? null
  }

  if (typeof payload.language === 'string') {
    book.language = payload.language
  }

  if (typeof payload.pageCount === 'number' || payload.pageCount === null) {
    book.pageCount = payload.pageCount
  }

  if (
    payload.publicationDate instanceof Date ||
    payload.publicationDate === null
  ) {
    book.publicationDate = payload.publicationDate
  }

  if (payload.coverImage) {
    book.coverImage = payload.coverImage
  }

  if (typeof payload.publisherId !== 'undefined') {
    book.publisherId = payload.publisherId
      ? new Types.ObjectId(payload.publisherId)
      : null
  }

  if (typeof payload.accessLevel === 'string') {
    book.accessLevel = payload.accessLevel
  }

  if (typeof payload.status === 'string') {
    book.status = payload.status
  }

  if (typeof payload.edition === 'string') {
    book.edition = sanitizeRequiredText(payload.edition, 'Edition', 1)
  }

  if (payload.edition === null) {
    book.edition = null
  }

  if (typeof payload.featured === 'boolean') {
    book.featured = payload.featured
  }

  if (typeof payload.availabilityStatus === 'string') {
    book.availabilityStatus = payload.availabilityStatus
  }

  if (Array.isArray(payload.authorIds)) {
    book.authorIds = toObjectIdArray(payload.authorIds)
  }

  if (Array.isArray(payload.categoryIds)) {
    book.categoryIds = toObjectIdArray(payload.categoryIds)
  }

  if (Array.isArray(payload.tags)) {
    book.tags = sanitizeTags(payload.tags)
  }
}
