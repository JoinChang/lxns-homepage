import { Router } from 'express'
import { prisma } from '../../lib/prisma'

const DAY_MS = 24 * 60 * 60 * 1000
const DAILY_WINDOW_DAYS = 14
const RECENT_WINDOW_DAYS = 7
const TOP_REFERRERS_LIMIT = 5
const TZ_OFFSET_MS = 8 * 60 * 60 * 1000

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function extractHost(raw: string): string {
  try {
    return new URL(raw).host || raw
  } catch {
    return raw
  }
}

export function createAdminAnalyticsRouter(): Router {
  const router = Router()

  router.get('/', async (_req, res) => {
    const now = new Date()
    const since24h = new Date(now.getTime() - DAY_MS)
    const since7d = new Date(now.getTime() - RECENT_WINDOW_DAYS * DAY_MS)
    const sinceDaily = new Date(now.getTime() - (DAILY_WINDOW_DAYS - 1) * DAY_MS)
    sinceDaily.setHours(0, 0, 0, 0)

    const [stats, last24hViews, last7dViews, recent] = await Promise.all([
      prisma.visitStats.findFirst(),
      prisma.pageView.count({ where: { createdAt: { gte: since24h } } }),
      prisma.pageView.count({ where: { createdAt: { gte: since7d } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: sinceDaily } },
        select: { createdAt: true, referrer: true },
      }),
    ])

    const daily: { date: string; views: number }[] = []
    for (let i = DAILY_WINDOW_DAYS - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * DAY_MS)
      daily.push({ date: toIsoDate(d), views: 0 })
    }
    const byDate = new Map(daily.map((d, i) => [d.date, i]))

    const hourly: number[] = Array(24).fill(0)
    const refCount = new Map<string, number>()
    const since7dMs = since7d.getTime()

    for (const pv of recent) {
      const ts = pv.createdAt.getTime()
      const idx = byDate.get(toIsoDate(pv.createdAt))
      if (idx !== undefined) daily[idx].views++

      if (ts >= since7dMs) {
        const localHour = new Date(ts + TZ_OFFSET_MS).getUTCHours()
        hourly[localHour]++

        if (pv.referrer && pv.referrer.trim()) {
          const host = extractHost(pv.referrer.trim())
          refCount.set(host, (refCount.get(host) ?? 0) + 1)
        }
      }
    }

    const topReferrers = Array.from(refCount.entries())
      .map(([host, views]) => ({ host, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, TOP_REFERRERS_LIMIT)

    const directViews = last7dViews - Array.from(refCount.values()).reduce((a, b) => a + b, 0)

    res.json({
      totalViews: stats?.totalViews ?? 0,
      uniqueViews: stats?.uniqueViews ?? 0,
      last24hViews,
      last7dViews,
      daily,
      hourly,
      topReferrers,
      directViews: Math.max(directViews, 0),
    })
  })

  return router
}
