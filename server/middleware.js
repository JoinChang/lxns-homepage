import { isProduction, base } from './config.js'

export async function setupMiddlewares(app) {
  /** @type {import('vite').ViteDevServer | undefined} */
  let vite

  if (!isProduction) {
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
    })
    app.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default
    const sirv = (await import('sirv')).default
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
  }

  return vite
}
