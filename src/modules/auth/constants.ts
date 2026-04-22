export const authConstants = {
  userRole: 'user',
  verificationTokenTtlMinutes: 30,
  verificationOtpTtlMinutes: 10,
  passwordResetOtpTtlMinutes: 15,
  resetTokenTtlMinutes: 5,
  twoFactorChallengeTokenTtlMinutes: 10,
  twoFactorEmailOtpTtlMinutes: 10,
  twoFactorEmailOtpMaxSendsPerWindow: 3,
  twoFactorEmailOtpWindowMinutes: 5,
  loginMaxAttempts: 5,
  lockoutMinutes: 15,
  loginHistoryDefaultLimit: 10,
  loginHistoryMaxLimit: 10,
} as const

export const USER_REFRESH_COOKIE_NAME = 'stackread_refresh'
