import { Router } from 'express'
import { getFavicon } from '../utils/favicon'

const router = Router()

export function createAPIRouter() {
  router.get('/favicon', async (req, res) => {
    const result = await getFavicon(req.query.url as string)

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
