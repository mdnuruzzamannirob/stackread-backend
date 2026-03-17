const mongoose = require('mongoose')
const { Schema } = mongoose

const loginHistorySchema = new Schema(
  {
    actor_id: { type: Schema.Types.ObjectId, required: true }, // ref to User or Staff
    actor_type: { type: String, enum: ['user', 'staff'], required: true },
    method: {
      type: String,
      enum: ['email', 'google', 'facebook'],
      required: true,
    },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null },
    device_type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    country: { type: String, default: null },
    status: { type: String, enum: ['success', 'failed'], required: true },
    fail_reason: { type: String, default: null },
  },
  { timestamps: true },
)

// TTL index — auto-delete after 90 days
loginHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
)
loginHistorySchema.index({ actor_id: 1, createdAt: -1 })

module.exports = mongoose.model('LoginHistory', loginHistorySchema)
