const passport = require('../config/passport')
const { sendError } = require('../utils/response')

/**
 * Middleware: authenticate a regular user via JWT Bearer token.
 * Attaches req.user on success.
 */
const authenticateUser = (req, res, next) => {
  passport.authenticate('user-jwt', { session: false }, (err, user) => {
    if (err) return next(err)
    if (!user) return sendError(res, 'Unauthorized. Please log in.', 401)
    req.user = user
    next()
  })(req, res, next)
}

/**
 * Middleware: optional user auth.
 * Attaches req.user if a valid token is present, otherwise continues without error.
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('user-jwt', { session: false }, (err, user) => {
    if (user) req.user = user
    next()
  })(req, res, next)
}

module.exports = { authenticateUser, optionalAuth }
