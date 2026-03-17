import { model, Schema, type Model } from 'mongoose'

import type { ICoupon, ICouponUsage, IFlashSale } from './interface'

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      required: false,
      default: undefined,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalLimit: {
      type: Number,
      required: false,
      default: undefined,
      min: 1,
    },
    usedCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    applicablePlanIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Plan',
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

couponSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 })

const flashSaleSchema = new Schema<IFlashSale>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    applicablePlanIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Plan',
      default: [],
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

flashSaleSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 })

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    usedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)

couponUsageSchema.index({ couponId: 1, userId: 1 })

export const CouponModel: Model<ICoupon> = model<ICoupon>(
  'Coupon',
  couponSchema,
)
export const FlashSaleModel: Model<IFlashSale> = model<IFlashSale>(
  'FlashSale',
  flashSaleSchema,
)
export const CouponUsageModel: Model<ICouponUsage> = model<ICouponUsage>(
  'CouponUsage',
  couponUsageSchema,
)
