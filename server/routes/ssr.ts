import { Router } from 'express'
import type { SSRService } from '../services/ssr'
import { prisma } from '../lib/prisma'
import { base } from '../config'

export function createSSRRouter(ssrService: SSRService): Router {
  const router = Router()

  router.get('*all', async (req, res) => {
    const [albums, friends] = await Promise.all([
      prisma.album
        .findMany({
          include: { artist: true },
          orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }, { createdAt: 'desc' }],
        })
        .catch((err) => {
          console.error('[ssr] prisma albums fetch failed', err)
          return []
        }),
      prisma.friend
        .findMany({
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        })
        .catch((err) => {
          console.error('[ssr] prisma friends fetch failed', err)
          return []
        }),
    ])

    const ssrData = {
      albums: albums.map((a) => ({
        id: a.id,
        file: a.file,
        url: a.url,
        ratio: a.ratio,
        date: a.date ? a.date.toISOString().slice(0, 10) : null,
        artist: a.artist
          ? {
              id: a.artist.id,
              name: a.artist.name,
              platform: a.artist.platform,
              href: a.artist.href,
            }
          : null,
        sortOrder: a.sortOrder,
      })),
      friends: friends.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        href: f.href,
        sortOrder: f.sortOrder,
      })),
    }

    await ssrService.handleSSRRequest(req, res, base, ssrData)
  })

  return router
}
