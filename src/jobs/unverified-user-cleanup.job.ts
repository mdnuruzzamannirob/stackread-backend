import { authConstants } from '../modules/auth/constants'
import { EmailOtpModel } from '../modules/auth/emailOtp.model'
import {
  UserEmailVerificationTokenModel,
  UserEphemeralTokenModel,
  UserModel,
} from '../modules/auth/model'

export const runUnverifiedUserCleanupJob = async (): Promise<{
  checked: number
  deleted: number
}> => {
  const cutoff = new Date(
    Date.now() - authConstants.verificationTokenTtlMinutes * 60 * 1000,
  )

  const candidates = await UserModel.find({
    isEmailVerified: false,
    createdAt: { $lt: cutoff },
  })
    .select('_id')
    .lean()

  let deleted = 0

  for (const candidate of candidates) {
    const activeToken = await UserEmailVerificationTokenModel.findOne({
      userId: candidate._id,
      expiresAt: { $gt: new Date() },
    })
      .select('_id')
      .lean()

    if (activeToken) {
      continue
    }

    await UserModel.deleteOne({ _id: candidate._id, isEmailVerified: false })
    await UserEmailVerificationTokenModel.deleteMany({ userId: candidate._id })
    await UserEphemeralTokenModel.deleteMany({ userId: candidate._id })
    await EmailOtpModel.deleteMany({
      actorId: candidate._id,
      actorType: 'user',
    })

    deleted += 1
  }

  return {
    checked: candidates.length,
    deleted,
  }
}
