import { Router, json } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { ApiError } from '../../lib/errors'
import type { ArtistPlatform } from '@prisma/client'

interface ExportedArtist {
  id: string
  name: string
  platform: ArtistPlatform | null
  href: string | null
  createdAt: string
  updatedAt: string
}

interface ExportedAlbum {
  id: string
  file: string
  url: string
  ratio: number
  date: string | null
  artistId: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface ExportedFriend {
  id: string
  name: string
  description: string
  href: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface Payload {
  version: number
  exportedAt: string
  artists: ExportedArtist[]
  albums: ExportedAlbum[]
  friends: ExportedFriend[]
}

const ARTIST_PLATFORMS = ['BILIBILI', 'TWITTER', 'WEIBO', 'PIXIV', 'OTHER'] as const

const isoOrDateTimeString = z.string().refine(
  (s) => !Number.isNaN(Date.parse(s)),
  { message: 'invalid date string' },
)

const ImportPayloadSchema = z.object({
  version: z.number().optional(),
  exportedAt: z.string().optional().nullable(),
  artists: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        platform: z.enum(ARTIST_PLATFORMS).nullable().optional(),
        href: z.string().nullable().optional(),
        createdAt: isoOrDateTimeString.optional(),
        updatedAt: isoOrDateTimeString.optional(),
      }),
    )
    .optional()
    .default([]),
  albums: z
    .array(
      z.object({
        id: z.string().min(1),
        file: z.string().min(1),
        url: z.string().min(1),
        ratio: z.number().gt(0),
        date: isoOrDateTimeString.nullable().optional(),
        artistId: z.string().nullable().optional(),
        sortOrder: z.number().int().optional(),
        createdAt: isoOrDateTimeString.optional(),
        updatedAt: isoOrDateTimeString.optional(),
      }),
    )
    .optional()
    .default([]),
  friends: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional().default(''),
        href: z.string().min(1),
        sortOrder: z.number().int().optional(),
        createdAt: isoOrDateTimeString.optional(),
        updatedAt: isoOrDateTimeString.optional(),
      }),
    )
    .optional()
    .default([]),
})

function toDate(v: string | Date | null | undefined): Date | undefined {
  if (!v) return undefined
  return v instanceof Date ? v : new Date(v)
}

export function createAdminDbRouter(): Router {
  const router = Router()

  router.get('/export', async (_req, res) => {
    const [artists, albums, friends] = await Promise.all([
      prisma.artist.findMany(),
      prisma.album.findMany(),
      prisma.friend.findMany(),
    ])
    const payload: Payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      artists: artists.map((a) => ({
        id: a.id,
        name: a.name,
        platform: a.platform,
        href: a.href,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      albums: albums.map((a) => ({
        id: a.id,
        file: a.file,
        url: a.url,
        ratio: a.ratio,
        date: a.date ? a.date.toISOString() : null,
        artistId: a.artistId,
        sortOrder: a.sortOrder,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      friends: friends.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        href: f.href,
        sortOrder: f.sortOrder,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
    }
    const filename = `db-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    res.set('Content-Type', 'application/json; charset=utf-8')
    res.set('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(JSON.stringify(payload, null, 2))
  })

  router.post('/import', json({ limit: '5mb' }), async (req, res) => {
    const payload = ImportPayloadSchema.parse(req.body)

    try {
      const counts = await prisma.$transaction(
        async (tx) => {
          let artists = 0
          let albums = 0
          let friends = 0

          for (const a of payload.artists) {
            await tx.artist.upsert({
              where: { id: a.id },
              update: {
                name: a.name,
                platform: a.platform ?? null,
                href: a.href ?? null,
              },
              create: {
                id: a.id,
                name: a.name,
                platform: a.platform ?? null,
                href: a.href ?? null,
                createdAt: toDate(a.createdAt),
                updatedAt: toDate(a.updatedAt),
              },
            })
            artists++
          }

          for (const a of payload.albums) {
            await tx.album.upsert({
              where: { id: a.id },
              update: {
                file: a.file,
                url: a.url,
                ratio: a.ratio,
                date: a.date ? toDate(a.date) : null,
                artistId: a.artistId ?? null,
                sortOrder: a.sortOrder ?? 0,
              },
              create: {
                id: a.id,
                file: a.file,
                url: a.url,
                ratio: a.ratio,
                date: a.date ? toDate(a.date) : null,
                artistId: a.artistId ?? null,
                sortOrder: a.sortOrder ?? 0,
                createdAt: toDate(a.createdAt),
                updatedAt: toDate(a.updatedAt),
              },
            })
            albums++
          }

          for (const f of payload.friends) {
            await tx.friend.upsert({
              where: { id: f.id },
              update: {
                name: f.name,
                description: f.description,
                href: f.href,
                sortOrder: f.sortOrder ?? 0,
              },
              create: {
                id: f.id,
                name: f.name,
                description: f.description,
                href: f.href,
                sortOrder: f.sortOrder ?? 0,
                createdAt: toDate(f.createdAt),
                updatedAt: toDate(f.updatedAt),
              },
            })
            friends++
          }

          return { artists, albums, friends }
        },
        { timeout: 30_000 },
      )

      res.json({
        ...counts,
        sourceExportedAt: payload.exportedAt ?? null,
      })
    } catch (err) {
      console.error('[db-import] failed', err)
      throw ApiError.internal('Import failed', (err as Error).message)
    }
  })

  return router
}
