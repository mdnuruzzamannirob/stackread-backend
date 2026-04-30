import rateLimit from 'express-rate-limit'

import { config } from '../../config'

const buildLimiter = (options: { max: number; message: string }) =>
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message,
      data: null,
    },
  })

export const apiRateLimiter = buildLimiter({
  max: config.rateLimitMax,
  message: 'Too many requests, please try again later.',
})

export const authRateLimiter = buildLimiter({
  max: config.rateLimitByGroup.auth,
  message: 'Too many authentication attempts, please try again later.',
})

export const adminRateLimiter = buildLimiter({
  max: config.rateLimitByGroup.admin,
  message: 'Too many admin requests, please slow down.',
})

export const searchRateLimiter = buildLimiter({
  max: config.rateLimitByGroup.search,
  message: 'Search rate limit reached, please try again shortly.',
})

export const webhookRateLimiter = buildLimiter({
  max: config.rateLimitByGroup.webhook,
  message: 'Webhook rate limit reached.',
})

export const reportsRateLimiter = buildLimiter({
  max: config.rateLimitByGroup.reports,
  message: 'Report request limit reached, please retry later.',
})
