import { z } from 'zod'

import { idParamSchema } from '../../common/validators/common'

const objectIdString = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format')

const gatewaySchema = z.enum(['bkash', 'nagad', 'paypal', 'mock'])

export const paymentsValidation = {
  idParam: idParamSchema,
  initiateBody: z.object({
    planId: objectIdString,
    gateway: gatewaySchema,
    couponCode: z.string().trim().min(2).max(40).toUpperCase().optional(),
    autoRenew: z.boolean().default(true),
  }),
  verifyBody: z.object({
    reference: z.string().trim().min(8).max(120),
    providerPaymentId: z.string().trim().min(2).max(200).optional(),
    gatewayTransactionId: z.string().trim().min(2).max(200).optional(),
    status: z.enum(['success', 'failed', 'pending']),
  }),
  refundBody: z.object({
    reason: z.string().trim().min(3).max(200),
  }),
  webhookParams: z.object({
    gateway: gatewaySchema,
  }),
  webhookBody: z.object({
    eventId: z.string().trim().min(2).max(200),
    reference: z.string().trim().min(8).max(120).optional(),
    providerPaymentId: z.string().trim().min(2).max(200).optional(),
    gatewayTransactionId: z.string().trim().min(2).max(200).optional(),
    status: z.enum(['success', 'failed', 'pending']).optional(),
    payload: z.record(z.unknown()).optional(),
  }),
}
