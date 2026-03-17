require('dotenv').config()

const required = ['MONGODB_URI', 'JWT_SECRET']

const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`,
  )
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // Database
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

  // Client
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Email (Nodemailer)
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Digital Library',
  EMAIL_FROM_ADDRESS:
    process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',

  // Tokens
  EMAIL_VERIFY_EXPIRES_HOURS: 24,
  PASSWORD_RESET_EXPIRES_HOURS: 1,
  STAFF_INVITE_EXPIRES_HOURS: 48,
}
