const mongoose = require('mongoose')
const { Schema } = mongoose

const passwordResetTokenSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token_hash: { type: String, required: true, unique: true }, // hashed token stored
    expires_at: { type: Date, required: true },
    used_at: { type: Date, default: null },
    ip_address: { type: String, default: null },
  },
  { timestamps: true },
)

// TTL index
passwordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })
passwordResetTokenSchema.index({ user_id: 1 })

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema)
