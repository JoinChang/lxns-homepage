import express from 'express'
import { port, ssrConfig } from './config'
import { setupMiddlewares } from './middleware'
import { SSRService } from './services/ssr'
import { createAPIRouter } from './routes/api'
import { createSSRRouter } from './routes/ssr'
import { createAuthRouter } from './routes/auth'
import { AnalyticsService } from './services/analytics'
import { errorMiddleware } from './lib/errors'

async function createServer() {
  const app = express()

  // 信任反向代理传来的 X-Forwarded-For，正确记录用户 IP 地址
  app.set('trust proxy', 1)

  app.use(express.json({ limit: '50mb' }))
  app.use(async (req, res, next) => {
    const isPageView =
      req.method === 'GET' &&
      req.path === '/' &&
      req.headers['accept']?.includes('text/html')
    if (isPageView) {
      AnalyticsService.recordPageView(
        req.path,
        req.get('User-Agent') || undefined,
        req.ip,
        req.get('Referrer') || undefined
      ).catch(console.error)
    }

    next()
  })

  const ssrService = new SSRService(ssrConfig)

  const vite = await setupMiddlewares(app)
  if (vite) {
    ssrService.setVite(vite)
  }

  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.set('Pragma', 'no-cache')
    res.set('Vary', 'Cookie')
    next()
  })
  app.use('/api/auth', createAuthRouter())
  app.use('/api', createAPIRouter())
  app.use('/api', errorMiddleware)
  app.use(createSSRRouter(ssrService))

  return app
}

createServer()
  .then((app) => {
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })
