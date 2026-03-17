const { validationResult } = require('express-validator')
const { sendError } = require('../utils/response')

/**
 * Run express-validator rules, then check for errors.
 * Usage: validate([ body('email').isEmail() ])
 */
const validate = (rules) => {
  return async (req, res, next) => {
    await Promise.all(rules.map((rule) => rule.run(req)))
    const result = validationResult(req)
    if (result.isEmpty()) return next()
    const errors = result.array().reduce((acc, err) => {
      acc[err.path] = err.msg
      return acc
    }, {})
    return sendError(res, 'Validation failed.', 422, errors)
  }
}

module.exports = { validate }
