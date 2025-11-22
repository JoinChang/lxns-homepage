import type { Express } from 'express'
import { createServer, type ViteDevServer } from 'vite'
import compression from 'compression'
import sirv from 'sirv'
import { isProduction, base } from './config'

export async function setupMiddlewares(app: Express): Promise<ViteDevServer | undefined> {
  if (!isProduction) {
    const vite = await createServer({
      server: { middlewareMode: true },
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
