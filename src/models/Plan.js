const mongoose = require('mongoose')
const { Schema } = mongoose

const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['free', 'basic', 'standard', 'premium'],
    },
    description: { type: String, default: '' },
    color: { type: String, default: '#6366f1' }, // UI accent color
    sort_order: { type: Number, default: 0 },

    // Pricing
    price_monthly: { type: Number, required: true, default: 0 },
    price_yearly: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'BDT' },

    // Limits (-1 = unlimited, 0 = disabled/preview only)
    borrow_limit: { type: Number, default: 0 },
    borrow_duration_days: { type: Number, default: 14 },
    book_access_limit: { type: Number, default: 0 }, // 0 = preview only, -1 = unlimited
    monthly_read_limit: { type: Number, default: -1 },

    // Features
    offline_access: { type: Boolean, default: false },
    is_free: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },

    // Feature bullet points for UI (e.g. ["Unlimited reading", "Borrow up to 5 books"])
    features: [{ type: String }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Plan', planSchema)
