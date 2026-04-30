import { AppError } from '../../common/errors/AppError'
import { IPublisher } from './interface'

export const formatPublisher = (publisher: IPublisher | null) => {
  if (!publisher) throw new AppError('Publisher not found.', 404)
  return {
    id: publisher._id.toString(),
    name: publisher.name,
    slug: publisher.slug,
    description: publisher.description,
    website: publisher.website,
    logo: publisher.logo ?? null,
    countryCode: publisher.countryCode,
    foundedYear: publisher.foundedYear,
    isActive: publisher.isActive,
    createdAt: publisher.createdAt.toISOString(),
    updatedAt: publisher.updatedAt.toISOString(),
  }
}
