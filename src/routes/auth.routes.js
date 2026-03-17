const express = require('express')
const rateLimit = require('express-rate-limit')
const authController = require('../controllers/auth.controller')
const { authenticateUser } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const {
  registerRules,
  loginRules,
  googleAuthRules,
  facebookAuthRules,
  verifyEmailRules,
  forgotPasswordRules,
  resetPasswordRules,
  updateProfileRules,
  changePasswordRules,
  notificationPrefsRules,
  loginHistoryRules,
} = require('../validators/auth.validator')

const router = express.Router()

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many requests. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  validate(registerRules),
  authController.register,
)
router.post('/login', authLimiter, validate(loginRules), authController.login)
router.post(
  '/google',
  authLimiter,
  validate(googleAuthRules),
  authController.googleAuth,
)
router.post(
  '/facebook',
  authLimiter,
  validate(facebookAuthRules),
  authController.facebookAuth,
)
router.post(
  '/verify-email',
  validate(verifyEmailRules),
  authController.verifyEmail,
)
router.post(
  '/forgot-password',
  strictLimiter,
  validate(forgotPasswordRules),
  authController.forgotPassword,
)
router.post(
  '/reset-password',
  strictLimiter,
  validate(resetPasswordRules),
  authController.resetPassword,
)

// ─── Authenticated Routes ─────────────────────────────────────────────────────
router.post('/logout', authenticateUser, authController.logout)
router.post(
  '/resend-verification',
  authenticateUser,
  strictLimiter,
  authController.resendVerification,
)

router.get('/me', authenticateUser, authController.getMe)
router.patch(
  '/me',
  authenticateUser,
  validate(updateProfileRules),
  authController.updateMe,
)
router.patch(
  '/me/password',
  authenticateUser,
  validate(changePasswordRules),
  authController.changePassword,
)
router.patch(
  '/me/notification-prefs',
  authenticateUser,
  validate(notificationPrefsRules),
  authController.updateNotificationPrefs,
)
router.get(
  '/me/login-history',
  authenticateUser,
  validate(loginHistoryRules),
  authController.getLoginHistory,
)

module.exports = router
