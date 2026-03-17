const mongoose = require('mongoose')
const { Schema } = mongoose

const emailVerifyTokenSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true }, // plain crypto token
    expires_at: { type: Date, required: true },
    used_at: { type: Date, default: null },
  },
  { timestamps: true },
)

// TTL index — MongoDB auto-deletes expired documents
emailVerifyTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })
emailVerifyTokenSchema.index({ user_id: 1 })

module.exports = mongoose.model('EmailVerifyToken', emailVerifyTokenSchema)
