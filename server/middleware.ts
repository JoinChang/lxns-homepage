import type { Express } from 'express'
import type { ViteDevServer } from 'vite'
import compression from 'compression'
import sirv from 'sirv'
import { isProduction, base } from './config'

export async function setupMiddlewares(app: Express): Promise<ViteDevServer | undefined> {
  if (!isProduction) {
    // 动态 import 使生产构建产物不加载 vite（vite 是 devDependency，且常驻内存开销大）
    const { createServer } = await import('vite')
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
