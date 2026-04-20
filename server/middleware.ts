import type { Express } from 'express'
import { createServer, type ViteDevServer } from 'vite'
import compression from 'compression'
import sirv from 'sirv'
import { isProduction, base } from './config'

export async function setupMiddlewares(app: Express): Promise<ViteDevServer | undefined> {
  if (!isProduction) {
    const usePolling = process.env.VITE_USE_POLLING !== 'false'
    const vite = await createServer({
      server: {
        middlewareMode: true,
        watch: usePolling
          ? { usePolling: true, interval: 200 }
          : undefined,
      },
      appType: 'custom',
      base,
    })
    app.use(vite.middlewares)
    return vite
  } else {
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
    return undefined
  }
}
