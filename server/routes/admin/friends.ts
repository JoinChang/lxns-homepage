import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

const CreateSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional().default(''),
  href: z.string().trim().min(1),
  sortOrder: z.number().int().optional(),
})

const UpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  href: z.string().trim().min(1).optional(),
  sortOrder: z.number().int().optional(),
})

const ReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export function createAdminFriendsRouter(): Router {
  const router = Router()

  router.get('/', async (_req, res) => {
    const friends = await prisma.friend.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    res.json(friends)
  })

  router.post('/', async (req, res) => {
    const body = CreateSchema.parse(req.body)
    const friend = await prisma.friend.create({
      data: {
        name: body.name,
        description: body.description,
        href: body.href,
        sortOrder: body.sortOrder ?? 0,
      },
    })
    res.status(201).json(friend)
  })

  router.post('/reorder', async (req, res) => {
    const { ids } = ReorderSchema.parse(req.body)
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.friend.update({ where: { id }, data: { sortOrder: i } }),
      ),
    )
    res.status(204).end()
  })

  router.patch('/:id', async (req, res) => {
    const { id } = req.params
    const body = UpdateSchema.parse(req.body)

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.href !== undefined) data.href = body.href
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

    const friend = await prisma.friend.update({ where: { id }, data })
    res.json(friend)
  })

  router.delete('/:id', async (req, res) => {
    const { id } = req.params
    await prisma.friend.delete({ where: { id } })
    res.status(204).end()
  })

  return router
}
