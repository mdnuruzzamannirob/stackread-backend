const bcrypt = require('bcryptjs')
const axios = require('axios')
const { OAuth2Client } = require('google-auth-library')
const env = require('../config/env')
const User = require('../models/User')
const EmailVerifyToken = require('../models/EmailVerifyToken')
const PasswordResetToken = require('../models/PasswordResetToken')
const LoginHistory = require('../models/LoginHistory')
const emailService = require('../services/email.service')
const {
  generateUserJWT,
  generateCryptoToken,
  hashToken,
  hoursFromNow,
  parseDeviceType,
} = require('../utils/token')
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
} = require('../utils/response')

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user }
  delete obj.password_hash
  delete obj.token_version
  delete obj.google_id
  delete obj.facebook_id
  return obj
}

const logLogin = async ({
  actorId,
  actorType = 'user',
  method,
  req,
  status,
  failReason = null,
}) => {
  try {
    const userAgent = req.headers['user-agent'] || ''
    await LoginHistory.create({
      actor_id: actorId,
      actor_type: actorType,
      method,
      ip_address: req.ip || req.connection?.remoteAddress || null,
      user_agent: userAgent,
      device_type: parseDeviceType(userAgent),
      status,
      fail_reason: failReason,
    })
  } catch {
    // Non-critical: never let logging failure break the auth flow
  }
}

const issueEmailVerifyToken = async (userId) => {
  const plain = generateCryptoToken(32)
  await EmailVerifyToken.create({
    user_id: userId,
    token: plain,
    expires_at: hoursFromNow(env.EMAIL_VERIFY_EXPIRES_HOURS),
  })
  return plain
}

// ─── POST /auth/register ──────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, language = 'en' } = req.body

    const existing = await User.findOne({ email })
    if (existing) return sendError(res, 'Email is already registered.', 409)

    const password_hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS)

    const user = await User.create({ name, email, password_hash, language })

    // Send verification email
    const token = await issueEmailVerifyToken(user._id)
    emailService
      .sendVerificationEmail({ to: email, name, token })
      .catch(() => {})

    const jwt = generateUserJWT(user)
    return sendCreated(
      res,
      { token: jwt, user: safeUser(user) },
      'Registration successful. Please verify your email.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user || !user.password_hash) {
      if (user)
        await logLogin({
          actorId: user._id,
          method: 'email',
          req,
          status: 'failed',
          failReason: 'invalid_credentials',
        })
      return sendError(res, 'Invalid email or password.', 401)
    }

    if (user.status === 'suspended') {
      await logLogin({
        actorId: user._id,
        method: 'email',
        req,
        status: 'failed',
        failReason: 'account_suspended',
      })
      return sendError(res, 'Your account has been suspended.', 403)
    }

    if (user.status === 'deleted') {
      return sendError(res, 'Account not found.', 404)
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      await logLogin({
        actorId: user._id,
        method: 'email',
        req,
        status: 'failed',
        failReason: 'invalid_credentials',
      })
      return sendError(res, 'Invalid email or password.', 401)
    }

    await User.findByIdAndUpdate(user._id, { last_active_at: new Date() })
    await logLogin({
      actorId: user._id,
      method: 'email',
      req,
      status: 'success',
    })

    const jwt = generateUserJWT(user)
    return sendSuccess(
      res,
      { token: jwt, user: safeUser(user) },
      'Login successful.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/google ────────────────────────────────────────────────────────

exports.googleAuth = async (req, res, next) => {
  try {
    const { id_token } = req.body

    let payload
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
    } catch {
      return sendError(res, 'Invalid Google token.', 401)
    }

    const { sub: google_id, email, name, picture } = payload

    // Find by google_id first, then by email
    let user = await User.findOne({ google_id })
    if (!user && email) user = await User.findOne({ email })

    if (user) {
      if (user.status === 'suspended')
        return sendError(res, 'Your account has been suspended.', 403)
      if (user.status === 'deleted')
        return sendError(res, 'Account not found.', 404)

      // Update google_id and avatar if missing
      const updates = {}
      if (!user.google_id) updates.google_id = google_id
      if (!user.avatar_url && picture) updates.avatar_url = picture
      updates.last_active_at = new Date()
      if (!user.email_verified) {
        updates.email_verified = true
        updates.email_verified_at = new Date()
      }
      await User.findByIdAndUpdate(user._id, updates)
      user = await User.findById(user._id)
    } else {
      // New user via Google
      user = await User.create({
        name,
        email,
        google_id,
        avatar_url: picture || null,
        email_verified: true,
        email_verified_at: new Date(),
      })
      emailService.sendWelcomeEmail({ to: email, name }).catch(() => {})
    }

    await logLogin({
      actorId: user._id,
      method: 'google',
      req,
      status: 'success',
    })
    const jwt = generateUserJWT(user)
    return sendSuccess(
      res,
      { token: jwt, user: safeUser(user) },
      'Google login successful.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/facebook ──────────────────────────────────────────────────────

exports.facebookAuth = async (req, res, next) => {
  try {
    const { access_token } = req.body

    let fbUser
    try {
      const { data } = await axios.get('https://graph.facebook.com/me', {
        params: { access_token, fields: 'id,name,email,picture.type(large)' },
      })
      fbUser = data
    } catch {
      return sendError(res, 'Invalid Facebook access token.', 401)
    }

    const { id: facebook_id, name, email, picture } = fbUser
    const avatar_url = picture?.data?.url || null

    let user = await User.findOne({ facebook_id })
    if (!user && email) user = await User.findOne({ email })

    if (user) {
      if (user.status === 'suspended')
        return sendError(res, 'Your account has been suspended.', 403)
      if (user.status === 'deleted')
        return sendError(res, 'Account not found.', 404)

      const updates = {}
      if (!user.facebook_id) updates.facebook_id = facebook_id
      if (!user.avatar_url && avatar_url) updates.avatar_url = avatar_url
      updates.last_active_at = new Date()
      if (!user.email_verified && email) {
        updates.email_verified = true
        updates.email_verified_at = new Date()
      }
      await User.findByIdAndUpdate(user._id, updates)
      user = await User.findById(user._id)
    } else {
      user = await User.create({
        name,
        email: email || null,
        facebook_id,
        avatar_url,
        email_verified: !!email,
        email_verified_at: email ? new Date() : null,
      })
      if (email)
        emailService.sendWelcomeEmail({ to: email, name }).catch(() => {})
    }

    await logLogin({
      actorId: user._id,
      method: 'facebook',
      req,
      status: 'success',
    })
    const jwt = generateUserJWT(user)
    return sendSuccess(
      res,
      { token: jwt, user: safeUser(user) },
      'Facebook login successful.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/logout ────────────────────────────────────────────────────────

exports.logout = async (req, res, next) => {
  try {
    // Increment token_version to invalidate all existing JWTs for this user
    await User.findByIdAndUpdate(req.user._id, { $inc: { token_version: 1 } })
    return sendSuccess(res, null, 'Logged out successfully.')
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/verify-email ──────────────────────────────────────────────────

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body

    const record = await EmailVerifyToken.findOne({ token, used_at: null })
    if (!record)
      return sendError(res, 'Invalid or expired verification token.', 400)

    if (record.expires_at < new Date()) {
      return sendError(
        res,
        'Verification token has expired. Please request a new one.',
        400,
      )
    }

    await User.findByIdAndUpdate(record.user_id, {
      email_verified: true,
      email_verified_at: new Date(),
    })

    await EmailVerifyToken.findByIdAndUpdate(record._id, {
      used_at: new Date(),
    })

    return sendSuccess(res, null, 'Email verified successfully.')
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/resend-verification ──────────────────────────────────────────

exports.resendVerification = async (req, res, next) => {
  try {
    const user = req.user

    if (user.email_verified) {
      return sendError(res, 'Email is already verified.', 400)
    }

    // Invalidate existing tokens (mark as used)
    await EmailVerifyToken.updateMany(
      { user_id: user._id, used_at: null },
      { used_at: new Date() },
    )

    const token = await issueEmailVerifyToken(user._id)
    emailService
      .sendVerificationEmail({ to: user.email, name: user.name, token })
      .catch(() => {})

    return sendSuccess(res, null, 'Verification email sent.')
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/forgot-password ───────────────────────────────────────────────

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    // Always return success to prevent email enumeration
    const user = await User.findOne({ email, status: 'active' })
    if (user && user.email_verified) {
      const plainToken = generateCryptoToken(32)
      const token_hash = hashToken(plainToken)

      // Invalidate old tokens
      await PasswordResetToken.updateMany(
        { user_id: user._id, used_at: null },
        { used_at: new Date() },
      )

      await PasswordResetToken.create({
        user_id: user._id,
        token_hash,
        expires_at: hoursFromNow(env.PASSWORD_RESET_EXPIRES_HOURS),
        ip_address: req.ip || null,
      })

      emailService
        .sendPasswordResetEmail({
          to: email,
          name: user.name,
          token: plainToken,
        })
        .catch(() => {})
    }

    return sendSuccess(
      res,
      null,
      'If that email is registered, a reset link has been sent.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── POST /auth/reset-password ────────────────────────────────────────────────

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body

    const token_hash = hashToken(token)
    const record = await PasswordResetToken.findOne({
      token_hash,
      used_at: null,
    })

    if (!record) return sendError(res, 'Invalid or expired reset token.', 400)
    if (record.expires_at < new Date())
      return sendError(res, 'Reset token has expired.', 400)

    const password_hash = await bcrypt.hash(password, env.BCRYPT_ROUNDS)

    // Update password and increment token_version to invalidate all existing JWTs
    await User.findByIdAndUpdate(record.user_id, {
      password_hash,
      $inc: { token_version: 1 },
    })

    await PasswordResetToken.findByIdAndUpdate(record._id, {
      used_at: new Date(),
    })

    return sendSuccess(
      res,
      null,
      'Password reset successfully. Please log in with your new password.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

exports.getMe = async (req, res, next) => {
  try {
    // Populate current plan for convenience
    const user = await User.findById(req.user._id)
      .populate(
        'current_plan_id',
        'name slug color features price_monthly price_yearly',
      )
      .select('-password_hash -token_version -google_id -facebook_id')

    return sendSuccess(res, user, 'OK')
  } catch (err) {
    next(err)
  }
}

// ─── PATCH /auth/me ───────────────────────────────────────────────────────────

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar_url', 'language', 'birthday', 'timezone']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    if (!Object.keys(updates).length) {
      return sendError(res, 'No valid fields to update.', 400)
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select('-password_hash -token_version -google_id -facebook_id')

    return sendSuccess(res, user, 'Profile updated.')
  } catch (err) {
    next(err)
  }
}

// ─── PATCH /auth/me/password ──────────────────────────────────────────────────

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body

    const user = await User.findById(req.user._id).select('+password_hash')

    if (!user.password_hash) {
      return sendError(
        res,
        'Cannot change password for accounts registered via Google or Facebook.',
        400,
      )
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash)
    if (!isValid) return sendError(res, 'Current password is incorrect.', 400)

    const password_hash = await bcrypt.hash(new_password, env.BCRYPT_ROUNDS)

    // Increment token_version to invalidate all existing sessions
    await User.findByIdAndUpdate(user._id, {
      password_hash,
      $inc: { token_version: 1 },
    })

    return sendSuccess(res, null, 'Password changed. Please log in again.')
  } catch (err) {
    next(err)
  }
}

// ─── PATCH /auth/me/notification-prefs ───────────────────────────────────────

exports.updateNotificationPrefs = async (req, res, next) => {
  try {
    const { email, sms, in_app, push } = req.body
    const prefs = {}
    if (email !== undefined) prefs['notification_prefs.email'] = email
    if (sms !== undefined) prefs['notification_prefs.sms'] = sms
    if (in_app !== undefined) prefs['notification_prefs.in_app'] = in_app
    if (push !== undefined) prefs['notification_prefs.push'] = push

    if (!Object.keys(prefs).length) {
      return sendError(res, 'No preference fields provided.', 400)
    }

    const user = await User.findByIdAndUpdate(req.user._id, prefs, {
      new: true,
    }).select('notification_prefs')

    return sendSuccess(
      res,
      { notification_prefs: user.notification_prefs },
      'Notification preferences updated.',
    )
  } catch (err) {
    next(err)
  }
}

// ─── GET /auth/me/login-history ───────────────────────────────────────────────

exports.getLoginHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100)
    const skip = (page - 1) * limit

    const filter = { actor_id: req.user._id, actor_type: 'user' }

    const [records, total] = await Promise.all([
      LoginHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      LoginHistory.countDocuments(filter),
    ])

    return sendPaginated(res, records, { page, limit, total })
  } catch (err) {
    next(err)
  }
}
