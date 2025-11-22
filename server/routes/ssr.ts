import { Router } from 'express'
import type { SSRService } from '../services/ssr'
import { base } from '../config'

export function createSSRRouter(ssrService: SSRService): Router {
  const router = Router()

  router.get('*all', async (req, res) => {
    await ssrService.handleSSRRequest(req, res, base)
  })

  return router
}

export default createSSRRouter
