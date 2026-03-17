import type { Types } from 'mongoose'

export type CouponDiscountType = 'percentage' | 'fixed'

export interface ICoupon {
  _id: Types.ObjectId
  code: string
  title: string
  description: string
  discountType: CouponDiscountType
  discountValue: number
  maxDiscountAmount: number | undefined
  minOrderAmount: number
  totalLimit: number | undefined
  usedCount: number
  applicablePlanIds: Types.ObjectId[]
  isActive: boolean
  startsAt: Date
  endsAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface IFlashSale {
  _id: Types.ObjectId
  title: string
  description: string
  discountPercentage: number
  applicablePlanIds: Types.ObjectId[]
  startsAt: Date
  endsAt: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICouponUsage {
  _id: Types.ObjectId
  couponId: Types.ObjectId
  userId: Types.ObjectId
  paymentId: Types.ObjectId
  amount: number
  usedAt: Date
}

export type DiscountResolution = {
  couponId?: string
  couponCode?: string
  flashSaleId?: string
  discountAmount: number
  discountBreakdown: {
    couponAmount: number
    flashSaleAmount: number
  }
}
