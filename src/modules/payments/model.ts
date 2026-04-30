import { model, Schema, type Model } from 'mongoose'

import type {
  IPayment,
  IWebhookLog,
  PaymentGateway,
  PaymentStatus,
  WebhookProcessingStatus,
} from './interface'

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ['bkash', 'nagad', 'stripe', 'paypal'] satisfies PaymentGateway[],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'initiated',
        'pending',
        'success',
        'failed',
        'refunded',
      ] satisfies PaymentStatus[],
      required: true,
      default: 'initiated',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      default: 'BDT',
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    payableAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: false,
      default: undefined,
      index: true,
    },
    flashSaleId: {
      type: Schema.Types.ObjectId,
      ref: 'FlashSale',
      required: false,
      default: undefined,
      index: true,
    },
    providerPaymentId: {
      type: String,
      required: false,
      default: undefined,
      index: true,
    },
    gatewayTransactionId: {
      type: String,
      required: false,
      default: undefined,
      index: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    verifiedAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    refundedAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    refundReason: {
      type: String,
      required: false,
      default: undefined,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

paymentSchema.index({ userId: 1, createdAt: -1 })
paymentSchema.index({ subscriptionId: 1, status: 1 })
paymentSchema.index({ provider: 1, providerPaymentId: 1 })

const webhookLogSchema = new Schema<IWebhookLog>(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ['bkash', 'nagad', 'stripe', 'paypal'] satisfies PaymentGateway[],
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    signature: {
      type: String,
      required: false,
      default: undefined,
    },
    payload: {
      type: String,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: [
        'received',
        'processed',
        'ignored',
        'failed',
      ] satisfies WebhookProcessingStatus[],
      required: true,
      default: 'received',
      index: true,
    },
    processedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: false,
      default: undefined,
      index: true,
    },
    errorMessage: {
      type: String,
      required: false,
      default: undefined,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

webhookLogSchema.index(
  { provider: 1, eventId: 1, gateway: 1 },
  { unique: true },
)

export const PaymentModel: Model<IPayment> = model<IPayment>(
  'Payment',
  paymentSchema,
)
export const WebhookLogModel: Model<IWebhookLog> = model<IWebhookLog>(
  'WebhookLog',
  webhookLogSchema,
)
