import { Router } from 'express'

const router = Router()

export function createAPIRouter(services) {
  const { publicService } = services

  router.get('/favicon', async (req, res) => {
    const result = await publicService.fetchFavicon(req.query.url)

    if (result.isOk()) {
      res.set('Content-Type', 'image/x-icon')
      res.send(result.value)
    } else {
      console.error('Favicon fetch error:', result.error.message)
      res.status(500).send('Error fetching favicon')
    }
  })

  return router
}

export default router
