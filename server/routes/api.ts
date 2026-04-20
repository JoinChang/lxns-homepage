import { Router } from 'express'
import { getFavicon } from '../utils/favicon'
import { requireAdmin } from '../lib/auth'
import { createAdminAlbumsRouter } from './admin/albums'
import { createAdminArtistsRouter } from './admin/artists'
import { createAdminFriendsRouter } from './admin/friends'
import { createAdminUploadRouter } from './admin/upload'
import { createAdminDbRouter } from './admin/db'
import { createAdminCosRouter } from './admin/cos'
import { createAdminAnalyticsRouter } from './admin/analytics'

export function createAPIRouter() {
  const router = Router()

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

  const adminRouter = Router()
  adminRouter.use(requireAdmin)
  adminRouter.use('/albums', createAdminAlbumsRouter())
  adminRouter.use('/artists', createAdminArtistsRouter())
  adminRouter.use('/friends', createAdminFriendsRouter())
  adminRouter.use('/upload', createAdminUploadRouter())
  adminRouter.use('/db', createAdminDbRouter())
  adminRouter.use('/cos', createAdminCosRouter())
  adminRouter.use('/analytics', createAdminAnalyticsRouter())
  router.use('/admin', adminRouter)

  return router
}
