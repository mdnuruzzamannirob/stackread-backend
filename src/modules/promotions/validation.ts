import { z } from 'zod'

import { idParamSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

const dateSchema = z.coerce.date()

export const promotionsValidation = {
  idParam: idParamSchema,
  validateCouponBody: z.object({
    code: z.string().trim().min(2).max(40).toUpperCase(),
    planId: objectIdString,
    amount: z.coerce.number().min(0),
  }),
  createCouponBody: z.object({
    code: z.string().trim().min(2).max(40).toUpperCase(),
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(3).max(300),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().min(0),
    maxDiscountAmount: z.coerce.number().min(0).optional(),
    minOrderAmount: z.coerce.number().min(0).default(0),
    totalLimit: z.coerce.number().int().min(1).optional(),
    applicablePlanIds: z.array(objectIdString).default([]),
    isActive: z.boolean().default(true),
    startsAt: dateSchema,
    endsAt: dateSchema,
  }),
  updateCouponBody: z
    .object({
      title: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().min(3).max(300).optional(),
      discountType: z.enum(['percentage', 'fixed']).optional(),
      discountValue: z.coerce.number().min(0).optional(),
      maxDiscountAmount: z.coerce.number().min(0).optional(),
      minOrderAmount: z.coerce.number().min(0).optional(),
      totalLimit: z.coerce.number().int().min(1).optional(),
      applicablePlanIds: z.array(objectIdString).optional(),
      startsAt: dateSchema.optional(),
      endsAt: dateSchema.optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: 'At least one field is required for coupon update',
    }),
  createFlashSaleBody: z.object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(3).max(300),
    discountPercentage: z.coerce.number().min(0).max(100),
    applicablePlanIds: z.array(objectIdString).default([]),
    isActive: z.boolean().default(true),
    startsAt: dateSchema,
    endsAt: dateSchema,
  }),
  updateFlashSaleBody: z
    .object({
      title: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().min(3).max(300).optional(),
      discountPercentage: z.coerce.number().min(0).max(100).optional(),
      applicablePlanIds: z.array(objectIdString).optional(),
      startsAt: dateSchema.optional(),
      endsAt: dateSchema.optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: 'At least one field is required for flash sale update',
    }),
}
