const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: null },
    password_hash: { type: String, default: null }, // null for pure OAuth users
    avatar_url: { type: String, default: null },
    birthday: { type: Date, default: null },
    timezone: { type: String, default: 'Asia/Dhaka' },
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },

    // Email verification
    email_verified: { type: Boolean, default: false },
    email_verified_at: { type: Date, default: null },

    // OAuth
    google_id: { type: String, default: null },
    facebook_id: { type: String, default: null },

    // Subscription (denormalized for fast auth checks)
    current_plan_id: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    plan_expires_at: { type: Date, default: null },
    subscription_status: {
      type: String,
      enum: ['free', 'trial', 'active', 'expired'],
      default: 'free',
    },

    // Reading stats
    total_books_read: { type: Number, default: 0 },
    total_reading_mins: { type: Number, default: 0 },
    reading_streak_days: { type: Number, default: 0 },
    last_active_at: { type: Date, default: Date.now },

    // Notification preferences
    notification_prefs: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },

    // Referral
    referral_code: { type: String, default: null },
    referred_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // Onboarding
    onboarding_completed: { type: Boolean, default: false },

    // Token versioning for logout invalidation
    token_version: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Indexes
userSchema.index({ google_id: 1 }, { unique: true, sparse: true })
userSchema.index({ facebook_id: 1 }, { unique: true, sparse: true })
userSchema.index({ referral_code: 1 }, { unique: true, sparse: true })
userSchema.index({ phone: 1 }, { unique: true, sparse: true })
userSchema.index({ status: 1 })
userSchema.index({ subscription_status: 1 })
userSchema.index({ current_plan_id: 1 })
userSchema.index({ plan_expires_at: 1 })

module.exports = mongoose.model('User', userSchema)
