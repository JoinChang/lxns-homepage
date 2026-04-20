import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

const ARTIST_PLATFORMS = ['BILIBILI', 'TWITTER', 'WEIBO', 'PIXIV', 'OTHER'] as const

const CreateSchema = z.object({
  name: z.string().trim().min(1),
  platform: z.enum(ARTIST_PLATFORMS).nullable().optional(),
  href: z.string().nullable().optional(),
})

const UpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  platform: z.enum(ARTIST_PLATFORMS).nullable().optional(),
  href: z.string().nullable().optional(),
})

export function createAdminArtistsRouter(): Router {
  const router = Router()

  router.get('/', async (_req, res) => {
    const artists = await prisma.artist.findMany({
      include: { _count: { select: { albums: true } } },
      orderBy: { name: 'asc' },
    })
    res.json(artists)
  })

  router.post('/', async (req, res) => {
    const body = CreateSchema.parse(req.body)
    const artist = await prisma.artist.create({
      data: {
        name: body.name,
        platform: body.platform ?? null,
        href: body.href ?? null,
      },
    })
    res.status(201).json(artist)
  })

  router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const body = UpdateSchema.parse(req.body)

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.platform !== undefined) data.platform = body.platform || null
    if (body.href !== undefined) data.href = body.href || null

    const artist = await prisma.artist.update({ where: { id }, data })
    res.json(artist)
  })

  router.delete('/:id', async (req, res) => {
    const { id } = req.params
    await prisma.artist.delete({ where: { id } })
    res.status(204).end()
  })

  return router
}
