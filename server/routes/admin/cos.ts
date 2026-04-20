import { Router } from 'express'
import { reconcileOrphans } from '../../lib/cosReconcile'

export function createAdminCosRouter(): Router {
  const router = Router()

  router.post('/reconcile', async (req, res) => {
    const apply = req.query.apply === '1' || req.query.apply === 'true'
    const result = await reconcileOrphans({ apply })
    const orphanTotal = result.orphansByLocation.reduce(
      (n, { orphans }) => n + orphans.length,
      0,
    )
    res.json({
      apply,
      totalCosObjects: result.totalCosObjects,
      knownUuids: result.knownUuids,
      orphanTotal,
      deleted: result.deleted,
      failed: result.failed,
      orphansByLocation: result.orphansByLocation.map(({ location, orphans }) => ({
        bucket: location.bucket,
        prefix: location.prefix,
        orphans,
      })),
    })
  })

  return router
}
