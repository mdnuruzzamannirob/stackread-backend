import { AppError } from '../../common/errors/AppError'
import { IAuthor } from './interface'

export const formatAuthor = (author: IAuthor | null) => {
  if (!author) {
    throw new AppError('Author not found.', 404)
  }

  return {
    id: author._id.toString(),
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    countryCode: author.countryCode,
    avatar: author.avatar ?? null,
    website: author.website,
    isActive: author.isActive,
    createdAt: author.createdAt.toISOString(),
    updatedAt: author.updatedAt.toISOString(),
  }
}
