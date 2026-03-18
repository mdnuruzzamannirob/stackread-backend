import { ReportJobModel } from '../modules/reports/model'
import { SettingsModel } from '../modules/settings/model'

export const migration20260318Phase9Hardening = async (): Promise<void> => {
  // Ensure singleton settings exists for deployment safety.
  await SettingsModel.updateOne(
    { singletonKey: 'global' },
    {
      $setOnInsert: {
        singletonKey: 'global',
        providers: {
          email: {
            provider: 'console',
            from: 'noreply@example.com',
            enabled: true,
          },
          sms: { provider: 'console', enabled: false },
          push: { provider: 'console', enabled: true },
          storage: { provider: 'local', enabled: true, basePath: 'uploads' },
          payment: { provider: 'sslcommerz', enabled: true, currency: 'BDT' },
        },
        templates: { email: {}, sms: {}, push: {} },
        maintenance: {
          enabled: false,
          message: 'System is currently under maintenance.',
          allowedIps: [],
        },
        trial: {
          enabled: true,
          durationDays: 7,
          maxBorrows: 2,
          autoActivate: true,
        },
      },
    },
    { upsert: true },
  )

  // Normalize stale processing jobs to queued for retry-safe restarts.
  await ReportJobModel.updateMany(
    {
      status: 'processing',
    },
    {
      $set: {
        status: 'queued',
      },
    },
  )
}
