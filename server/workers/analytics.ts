import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { prisma } from '../lib/prisma'
import { redisUrl } from '../config'

const redis = new Redis(redisUrl)

const connection = { connection: { url: redisUrl } }

function uniqueKeyForToday() {
  return `unique_visitors:${new Date().toISOString().slice(0, 10)}`
}

console.log('Analytics Worker started...')

const worker = new Worker(
  'analytics',
  async (job: Job) => {
    const it = job.data as {
      path: string
      userAgent?: string | null
      ip?: string | null
      referrer?: string | null
      ts?: number
    }

    await prisma.$transaction(async (tx) => {
      await tx.pageView.create({
        data: {
          path: it.path,
          userAgent: it.userAgent ?? null,
          ip: it.ip ?? null,
          referrer: it.referrer ?? null,
          createdAt: it.ts ? new Date(it.ts) : undefined,
        },
      })
      const stats = await tx.visitStats.findFirst()
      if (stats) {
        await tx.visitStats.update({
          where: { id: stats.id },
          data: { totalViews: { increment: 1 } },
        })
      } else {
        await tx.visitStats.create({
          data: { totalViews: 1, uniqueViews: 0 },
        })
      }
    })

    if (it.ip) {
      try {
        const key = uniqueKeyForToday()
        const added = await redis.sadd(key, it.ip)
        await redis.expire(key, 60 * 60 * 24 * 8)
        if (added === 1) {
          const stats = await prisma.visitStats.findFirst()
          if (stats) {
            await prisma.visitStats.update({
              where: { id: stats.id },
              data: { uniqueViews: { increment: 1 } },
            })
          }
        }
      } catch (e) {
        console.error('Redis error while determining unique visitor:', e)
      }
    }

    return { ok: true }
  },
  {
    ...connection,
    concurrency: 5,
  }
)

worker.on('failed', (job, err) => {
  console.error('Failed job', job?.id, err)
})
