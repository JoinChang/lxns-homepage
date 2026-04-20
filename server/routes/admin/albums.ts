import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { deleteAlbumImage } from '../../lib/cos'
import { ApiError } from '../../lib/errors'

const CreateSchema = z.object({
  file: z.string().min(1),
  url: z.string().min(1),
  ratio: z.number().gt(0),
  date: z.string().nullable().optional(),
  artistId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
})

const UpdateSchema = z.object({
  file: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  ratio: z.number().gt(0).optional(),
  date: z.string().nullable().optional(),
  artistId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export function createAdminAlbumsRouter(): Router {
  const router = Router()

  router.get('/', async (_req, res) => {
    const albums = await prisma.album.findMany({
      include: { artist: true },
      orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }, { createdAt: 'desc' }],
    })
    res.json(albums)
  })

  router.post('/', async (req, res) => {
    const body = CreateSchema.parse(req.body)
    const album = await prisma.album.create({
      data: {
        file: body.file,
        url: body.url,
        ratio: body.ratio,
        date: body.date ? new Date(body.date) : null,
        artistId: body.artistId || null,
        sortOrder: body.sortOrder ?? 0,
      },
      include: { artist: true },
    })
    res.status(201).json(album)
  })

  router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const body = UpdateSchema.parse(req.body)

    const old = await prisma.album.findUnique({ where: { id } })
    if (!old) throw ApiError.notFound('Album not found')

    const data: Record<string, unknown> = {}
    if (body.file !== undefined) data.file = body.file
    if (body.url !== undefined) data.url = body.url
    if (body.ratio !== undefined) data.ratio = body.ratio
    if (body.date !== undefined) data.date = body.date ? new Date(body.date) : null
    if (body.artistId !== undefined) data.artistId = body.artistId || null
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

    const album = await prisma.album.update({
      where: { id },
      data,
      include: { artist: true },
    })
    // 若 file key 变化，旧 COS 对象成为孤儿，异步清理
    if (body.file !== undefined && body.file !== old.file) {
      deleteAlbumImage(old.file).catch((err) => {
        console.warn('[cos] orphan cleanup failed for', old.file, err)
      })
    }
    res.json(album)
  })

  router.delete('/:id', async (req, res) => {
    const { id } = req.params
    const album = await prisma.album.delete({ where: { id } })
    deleteAlbumImage(album.file).catch((err) => {
      console.warn('[cos] delete failed for', album.file, err)
    })
    res.status(204).end()
  })

  return router
}
