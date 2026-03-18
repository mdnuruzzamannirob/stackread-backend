process.env.NODE_ENV = process.env.NODE_ENV ?? 'test'
process.env.PORT = process.env.PORT ?? '5050'
process.env.API_VERSION = process.env.API_VERSION ?? 'v1'
process.env.MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/lms-test'
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? 'http://localhost:3000'
process.env.JWT_USER_SECRET = process.env.JWT_USER_SECRET ?? 'test-user-secret'
process.env.JWT_STAFF_SECRET =
  process.env.JWT_STAFF_SECRET ?? 'test-staff-secret'
process.env.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? '1h'
process.env.JWT_ISSUER = process.env.JWT_ISSUER ?? 'lms-test'
process.env.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER ?? 'console'
process.env.EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@test.local'
process.env.SMS_PROVIDER = process.env.SMS_PROVIDER ?? 'console'
process.env.PUSH_PROVIDER = process.env.PUSH_PROVIDER ?? 'console'
process.env.STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? 'local'
process.env.PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER ?? 'sslcommerz'
process.env.SSLCOMMERZ_STORE_ID =
  process.env.SSLCOMMERZ_STORE_ID ?? 'test-store-id'
process.env.SSLCOMMERZ_STORE_PASSWORD =
  process.env.SSLCOMMERZ_STORE_PASSWORD ?? 'test-store-pass'
process.env.SSLCOMMERZ_IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE ?? 'false'
