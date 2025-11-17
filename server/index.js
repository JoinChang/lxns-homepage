import express from 'express'
import { port, ssrConfig, publicServiceConfig } from './config.js'
import { setupMiddlewares } from './middleware.js'
import { PublicService } from './services/PublicService.js'
import { SSRService } from './services/SSRService.js'
import { createAPIRouter } from './routes/api.js'
import { createSSRRouter } from './routes/ssr.js'

// Create http server
const app = express()

// Initialize services
const publicService = new PublicService(publicServiceConfig)
const ssrService = new SSRService(ssrConfig)

// Setup Vite or production middlewares
const vite = await setupMiddlewares(app)
if (vite) {
  ssrService.setVite(vite)
}

// Mount routes with dependency injection
app.use('/api', createAPIRouter({ publicService }))
app.use(createSSRRouter({ ssrService }))

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
