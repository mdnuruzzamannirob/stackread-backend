const { body } = require('express-validator')

const selectPlanRules = [
  body('plan_id')
    .notEmpty()
    .withMessage('plan_id is required.')
    .isMongoId()
    .withMessage('Invalid plan_id.'),
  body('billing_cycle')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('billing_cycle must be monthly or yearly.'),
]

module.exports = { selectPlanRules }
