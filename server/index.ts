import express from 'express'
import { port, ssrConfig } from './config'
import { setupMiddlewares } from './middleware'
import { SSRService } from './services/ssr'
import { createAPIRouter } from './routes/api'
import { createSSRRouter } from './routes/ssr'
import { AnalyticsService } from './services/analytics'

async function createServer() {
  // Create http server
  const app = express()

  // Setup middlewares
  app.use(express.json())
  app.use(async (req, res, next) => {
    if (req.headers['accept']?.includes('text/html')) {
      AnalyticsService.recordPageView(
        req.path,
        req.get('User-Agent') || undefined,
        req.ip,
        req.get('Referrer') || undefined
      ).catch(console.error)
    }

    next()
  })

  // Initialize services
  const ssrService = new SSRService(ssrConfig)

  // Setup Vite or production middlewares
  const vite = await setupMiddlewares(app)
  if (vite) {
    ssrService.setVite(vite)
  }

  // Mount routes
  app.use('/api', createAPIRouter())
  app.use(createSSRRouter(ssrService))

  return app
}

// Start http server
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
