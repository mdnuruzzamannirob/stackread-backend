const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const env = require('../config/env')

/**
 * Generate a signed JWT for a user.
 * Includes token_version (tv) to support logout invalidation.
 */
const generateUserJWT = (user) => {
  return jwt.sign(
    { id: user._id, type: 'user', tv: user.token_version },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  )
}

/**
 * Generate a cryptographically random hex token (plain, for email links).
 */
const generateCryptoToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * SHA-256 hash of a plain token (for storing password reset tokens securely).
 */
const hashToken = (plain) => {
  return crypto.createHash('sha256').update(plain).digest('hex')
}

/**
 * Add hours to the current date/time.
 */
const hoursFromNow = (hours) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

/**
 * Parse device type from User-Agent string.
 */
const parseDeviceType = (userAgent = '') => {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad/.test(ua)) {
    return /ipad/.test(ua) ? 'tablet' : 'mobile'
  }
  return 'desktop'
}

module.exports = {
  generateUserJWT,
  generateCryptoToken,
  hashToken,
  hoursFromNow,
  parseDeviceType,
}
