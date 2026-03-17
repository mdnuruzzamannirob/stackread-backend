const mongoose = require('mongoose')
const { Schema } = mongoose

const deviceTokenSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true }, // FCM token
    platform: { type: String, enum: ['web', 'android', 'ios'], required: true },
    device_name: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    last_used_at: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

deviceTokenSchema.index({ user_id: 1, is_active: 1 })

module.exports = mongoose.model('DeviceToken', deviceTokenSchema)
