import crypto from 'node:crypto'

import mongoose, { ClientSession, Types } from 'mongoose'

import { AppError } from '../../common/errors/AppError'
import { paymentProviderService } from '../../common/services/payment-provider.service'
import { PlanModel } from '../plans/model'
import { promotionsService } from '../promotions/service'
import { subscriptionsService } from '../subscriptions/service'
import type { IPayment, PaymentGateway } from './interface'
import { PaymentModel, WebhookLogModel } from './model'

type PaymentVerificationInput = {
  reference: string
  providerPaymentId?: string
  gatewayTransactionId?: string
  status: 'success' | 'failed' | 'pending'
}

type WebhookInput = {
  eventId: string
  reference?: string
  providerPaymentId?: string
  gatewayTransactionId?: string
  status?: 'success' | 'failed' | 'pending'
  payload?: Record<string, unknown>
}

interface PaymentGatewayAdapter {
  gateway: PaymentGateway
  initiate(payload: {
    amount: number
    currency: string
    reference: string
    customerName: string
    customerEmail: string
    metadata: Record<string, string>
  }): Promise<{
    provider: string
    providerPaymentId: string
    status: 'pending' | 'success'
    redirectUrl?: string
  }>
  verifyWebhook(
    payload: string,
    signature?: string,
  ): Promise<{
    provider: string
    providerPaymentId: string
    status: 'success' | 'failed' | 'pending'
    raw: unknown
  }>
}

class SslCommerzBangladeshAdapter implements PaymentGatewayAdapter {
  constructor(public readonly gateway: 'bkash' | 'nagad') {}

  async initiate(payload: {
    amount: number
    currency: string
    reference: string
    customerName: string
    customerEmail: string
    metadata: Record<string, string>
  }) {
    const result = await paymentProviderService.initiatePayment({
      amount: payload.amount,
      currency: payload.currency,
      reference: payload.reference,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      metadata: {
        ...payload.metadata,
        gateway: this.gateway,
      },
    })

    return {
      provider: result.provider,
      providerPaymentId: result.paymentId,
      status: result.status,
      ...(result.redirectUrl ? { redirectUrl: result.redirectUrl } : {}),
    }
  }

  async verifyWebhook(payload: string, signature?: string) {
    const result = await paymentProviderService.verifyWebhook(
      payload,
      signature,
    )

    return {
      provider: result.provider,
      providerPaymentId: result.paymentId,
      status: result.status,
      raw: result.raw,
    }
  }
}

class PaypalGatewayAdapter implements PaymentGatewayAdapter {
  public readonly gateway = 'paypal' as const

  async initiate(payload: {
    amount: number
    currency: string
    reference: string
    customerName: string
    customerEmail: string
    metadata: Record<string, string>
  }) {
    const result = await paymentProviderService.initiatePayment({
      amount: payload.amount,
      currency: payload.currency,
      reference: payload.reference,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      metadata: payload.metadata,
    })

    return {
      provider: result.provider,
      providerPaymentId: result.paymentId,
      status: result.status,
      ...(result.redirectUrl ? { redirectUrl: result.redirectUrl } : {}),
    }
  }

  async verifyWebhook(payload: string, signature?: string) {
    const result = await paymentProviderService.verifyWebhook(
      payload,
      signature,
    )

    return {
      provider: result.provider,
      providerPaymentId: result.paymentId,
      status: result.status,
      raw: result.raw,
    }
  }
}

class MockGatewayAdapter implements PaymentGatewayAdapter {
  public readonly gateway = 'mock' as const

  async initiate(payload: {
    amount: number
    currency: string
    reference: string
    customerName: string
    customerEmail: string
    metadata: Record<string, string>
  }) {
    const result = await paymentProviderService.initiatePayment({
      amount: payload.amount,
      currency: payload.currency,
      reference: payload.reference,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      metadata: payload.metadata,
    })

    return {
      provider: result.provider,
      providerPaymentId: result.paymentId,
      status: result.status,
      ...(result.redirectUrl ? { redirectUrl: result.redirectUrl } : {}),
    }
  }

  async verifyWebhook(payload: string, signature?: string) {
    const result = await paymentProviderService.verifyWebhook(
      payload,
      signature,
    )

    return {
      provider: result.provider,
      providerPaymentId: result.paymentId,
      status: result.status,
      raw: result.raw,
    }
  }
}

const resolveGatewayAdapter = (
  gateway: PaymentGateway,
): PaymentGatewayAdapter => {
  if (gateway === 'bkash' || gateway === 'nagad') {
    return new SslCommerzBangladeshAdapter(gateway)
  }

  if (gateway === 'paypal') {
    return new PaypalGatewayAdapter()
  }

  return new MockGatewayAdapter()
}

const formatPayment = (payment: IPayment) => {
  return {
    id: payment._id.toString(),
    userId: payment.userId.toString(),
    subscriptionId: payment.subscriptionId.toString(),
    provider: payment.provider,
    gateway: payment.gateway,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    discountAmount: payment.discountAmount,
    payableAmount: payment.payableAmount,
    couponId: payment.couponId?.toString(),
    flashSaleId: payment.flashSaleId?.toString(),
    providerPaymentId: payment.providerPaymentId,
    gatewayTransactionId: payment.gatewayTransactionId,
    reference: payment.reference,
    metadata: payment.metadata,
    verifiedAt: payment.verifiedAt?.toISOString(),
    refundedAt: payment.refundedAt?.toISOString(),
    refundReason: payment.refundReason,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  }
}

const findPaymentForVerification = async (
  verification: PaymentVerificationInput,
  session?: ClientSession,
) => {
  const criteria: Record<string, unknown>[] = [
    { reference: verification.reference },
  ]

  if (verification.providerPaymentId) {
    criteria.push({ providerPaymentId: verification.providerPaymentId })
  }

  if (verification.gatewayTransactionId) {
    criteria.push({ gatewayTransactionId: verification.gatewayTransactionId })
  }

  const query = PaymentModel.findOne({ $or: criteria })

  if (session) {
    query.session(session)
  }

  return query
}

const applyVerificationTransaction = async (
  verification: PaymentVerificationInput,
  session: ClientSession,
) => {
  const payment = await findPaymentForVerification(verification, session)

  if (!payment) {
    throw new AppError('Payment not found for verification.', 404)
  }

  if (payment.status === 'refunded') {
    throw new AppError('Refunded payment cannot be verified again.', 400)
  }

  if (payment.status === 'success') {
    return payment
  }

  payment.status =
    verification.status === 'success' ? 'success' : verification.status
  payment.providerPaymentId =
    verification.providerPaymentId ?? payment.providerPaymentId
  payment.gatewayTransactionId =
    verification.gatewayTransactionId ?? payment.gatewayTransactionId

  if (payment.status === 'success') {
    payment.verifiedAt = new Date()
  }

  await payment.save({ session })

  if (payment.status === 'success') {
    await subscriptionsService.activateSubscriptionFromPayment(
      {
        subscriptionId: payment.subscriptionId.toString(),
        paymentId: payment._id.toString(),
        userId: payment.userId.toString(),
      },
      session,
    )

    if (payment.couponId && payment.discountAmount > 0) {
      await promotionsService.markCouponUsed(
        {
          couponId: payment.couponId.toString(),
          userId: payment.userId.toString(),
          paymentId: payment._id.toString(),
          amount: payment.discountAmount,
        },
        session,
      )
    }
  }

  return payment
}

export const paymentsService = {
  listMyPayments: async (userId: string) => {
    const payments = await PaymentModel.find({ userId }).sort({ createdAt: -1 })
    return payments.map((payment) => formatPayment(payment))
  },

  getMyPaymentById: async (userId: string, id: string) => {
    const payment = await PaymentModel.findOne({ _id: id, userId })

    if (!payment) {
      throw new AppError('Payment not found.', 404)
    }

    return formatPayment(payment)
  },

  listPayments: async () => {
    const payments = await PaymentModel.find({}).sort({ createdAt: -1 })
    return payments.map((payment) => formatPayment(payment))
  },

  getPaymentById: async (id: string) => {
    const payment = await PaymentModel.findById(id)

    if (!payment) {
      throw new AppError('Payment not found.', 404)
    }

    return formatPayment(payment)
  },

  initiatePayment: async (payload: {
    userId: string
    planId: string
    gateway: PaymentGateway
    couponCode?: string
    autoRenew?: boolean
  }) => {
    const plan = await PlanModel.findById(payload.planId)

    if (!plan || !plan.isActive) {
      throw new AppError('Plan not found or inactive.', 404)
    }

    const discountResolution = await promotionsService.resolvePaymentDiscount({
      planId: payload.planId,
      amount: plan.price,
      ...(payload.couponCode ? { couponCode: payload.couponCode } : {}),
      userId: payload.userId,
    })

    const payableAmount = Number(
      Math.max(0, plan.price - discountResolution.discountAmount).toFixed(2),
    )

    const pendingSubscription =
      await subscriptionsService.createPendingSubscriptionForPlan({
        userId: payload.userId,
        planId: payload.planId,
        ...(typeof payload.autoRenew === 'boolean'
          ? { autoRenew: payload.autoRenew }
          : {}),
      })

    const reference = `PAY-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const gatewayAdapter = resolveGatewayAdapter(payload.gateway)

    const gatewayResult = await gatewayAdapter.initiate({
      amount: payableAmount,
      currency: plan.currency,
      reference,
      customerName: 'LMS User',
      customerEmail: 'customer@example.com',
      metadata: {
        subscriptionId: pendingSubscription._id.toString(),
        userId: payload.userId,
        gateway: payload.gateway,
      },
    })

    const payment = await PaymentModel.create({
      userId: new Types.ObjectId(payload.userId),
      subscriptionId: pendingSubscription._id,
      provider: gatewayResult.provider,
      gateway: payload.gateway,
      status: gatewayResult.status === 'success' ? 'success' : 'pending',
      amount: plan.price,
      currency: plan.currency,
      discountAmount: discountResolution.discountAmount,
      payableAmount,
      ...(discountResolution.couponId
        ? { couponId: new Types.ObjectId(discountResolution.couponId) }
        : {}),
      ...(discountResolution.flashSaleId
        ? { flashSaleId: new Types.ObjectId(discountResolution.flashSaleId) }
        : {}),
      providerPaymentId: gatewayResult.providerPaymentId,
      reference,
      metadata: {
        discountBreakdown: discountResolution.discountBreakdown,
        couponCode: discountResolution.couponCode,
      },
    })

    if (gatewayResult.status === 'success') {
      await paymentsService.verifyPayment({
        reference,
        providerPaymentId: gatewayResult.providerPaymentId,
        status: 'success',
      })
    }

    return {
      payment: formatPayment(payment),
      ...(gatewayResult.redirectUrl
        ? { redirectUrl: gatewayResult.redirectUrl }
        : {}),
    }
  },

  verifyPayment: async (verification: PaymentVerificationInput) => {
    const session = await mongoose.startSession()

    try {
      let verifiedPayment: IPayment | null = null

      await session.withTransaction(async () => {
        verifiedPayment = await applyVerificationTransaction(
          verification,
          session,
        )
      })

      if (!verifiedPayment) {
        throw new AppError('Payment verification failed.', 500)
      }

      return formatPayment(verifiedPayment)
    } finally {
      await session.endSession()
    }
  },

  refundPayment: async (paymentId: string, reason: string) => {
    const session = await mongoose.startSession()

    try {
      let refundedPayment: IPayment | null = null

      await session.withTransaction(async () => {
        const payment = await PaymentModel.findById(paymentId).session(session)

        if (!payment) {
          throw new AppError('Payment not found.', 404)
        }

        if (payment.status !== 'success') {
          throw new AppError('Only successful payments can be refunded.', 400)
        }

        payment.status = 'refunded'
        payment.refundedAt = new Date()
        payment.refundReason = reason
        await payment.save({ session })

        const subscription = await mongoose
          .model('Subscription')
          .findById(payment.subscriptionId)
          .session(session)

        if (subscription) {
          subscription.status = 'cancelled'
          subscription.cancelledAt = new Date()
          subscription.cancellationReason = `Refunded payment: ${reason}`
          subscription.autoRenew = false
          await subscription.save({ session })
        }

        refundedPayment = payment
      })

      if (!refundedPayment) {
        throw new AppError('Payment refund failed.', 500)
      }

      return formatPayment(refundedPayment)
    } finally {
      await session.endSession()
    }
  },

  processWebhook: async (
    gateway: PaymentGateway,
    payload: WebhookInput,
    signature?: string,
  ) => {
    const existingLog = await WebhookLogModel.findOne({
      provider: gateway,
      gateway,
      eventId: payload.eventId,
    })

    if (existingLog) {
      return {
        alreadyProcessed: true,
        processingStatus: existingLog.processingStatus,
        webhookLogId: existingLog._id.toString(),
      }
    }

    const webhookLog = await WebhookLogModel.create({
      provider: gateway,
      gateway,
      eventId: payload.eventId,
      ...(signature ? { signature } : {}),
      payload: JSON.stringify(payload.payload ?? payload),
      processingStatus: 'received',
    })

    try {
      const adapter = resolveGatewayAdapter(gateway)
      const verification = await adapter.verifyWebhook(
        JSON.stringify(payload.payload ?? payload),
        signature,
      )

      const reference = payload.reference
      const providerPaymentId =
        payload.providerPaymentId ?? verification.providerPaymentId
      const gatewayTransactionId = payload.gatewayTransactionId
      const status = payload.status ?? verification.status

      if (!reference && !providerPaymentId && !gatewayTransactionId) {
        webhookLog.processingStatus = 'ignored'
        webhookLog.errorMessage = 'No payment lookup keys in webhook payload.'
        await webhookLog.save()

        return {
          alreadyProcessed: false,
          processingStatus: webhookLog.processingStatus,
          webhookLogId: webhookLog._id.toString(),
        }
      }

      const payment = await paymentsService.verifyPayment({
        reference: reference ?? `fallback-${payload.eventId}`,
        ...(providerPaymentId ? { providerPaymentId } : {}),
        ...(gatewayTransactionId ? { gatewayTransactionId } : {}),
        status,
      })

      webhookLog.processingStatus = 'processed'
      webhookLog.processedPaymentId = new Types.ObjectId(payment.id)
      await webhookLog.save()

      return {
        alreadyProcessed: false,
        processingStatus: webhookLog.processingStatus,
        webhookLogId: webhookLog._id.toString(),
        paymentId: payment.id,
      }
    } catch (error) {
      webhookLog.processingStatus = 'failed'
      webhookLog.errorMessage =
        error instanceof Error ? error.message : String(error)
      await webhookLog.save()

      throw error
    }
  },
}
