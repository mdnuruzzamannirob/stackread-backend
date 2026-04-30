import { model, Schema, type Model } from 'mongoose'
import type { IPublisher } from './interface'

const publisherSchema = new Schema<IPublisher>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    website: { type: String, required: false, trim: true, default: null },
    logo: {
      type: new Schema(
        {
          provider: {
            type: String,
            enum: ['cloudinary'],
            required: true,
            default: 'cloudinary',
          },
          publicId: { type: String, required: true, trim: true },
          url: { type: String, required: true, trim: true },
        },
        { _id: false },
      ),
      required: false,
      default: null,
    },
    countryCode: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      default: null,
      index: true,
    },
    foundedYear: { type: Number, required: false, default: null },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
)

publisherSchema.index({ name: 'text', slug: 'text', description: 'text' })
publisherSchema.index({ isActive: 1, name: 1 })

export const PublisherModel: Model<IPublisher> = model<IPublisher>(
  'Publisher',
  publisherSchema,
)
