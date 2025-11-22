import { Queue } from 'bullmq'
import { ok, err } from 'neverthrow'

const connection = { connection: { url: process.env.REDIS_URL } }

export const analyticsQueue = new Queue('analytics', connection)

export class AnalyticsService {
  static async recordPageView(
    path: string,
    userAgent?: string,
    ip?: string,
    referrer?: string
  ) {
    try {
      await analyticsQueue.add(
        'page-view',
        {
          path,
          userAgent: userAgent ?? null,
          ip: ip ?? null,
          referrer: referrer ?? null,
          ts: Date.now(),
        },
        {
          removeOnComplete: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        }
      )

      return ok(undefined)
    } catch (error) {
      return err(error as Error)
    }
  }
}
