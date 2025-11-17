import { Router } from 'express'
import { Transform } from 'node:stream'
import { base, ABORT_DELAY } from '../config.js'

const router = Router()

export function createSSRRouter(services) {
  const { ssrService } = services

  router.get('*all', async (req, res) => {
    const url = req.originalUrl.replace(base, '')
    
    const ssrResult = await ssrService.loadTemplate(url)
    
    if (ssrResult.isErr()) {
      ssrService.fixStacktrace(ssrResult.error)
      console.error('SSR template load error:', ssrResult.error.message)
      console.error(ssrResult.error.stack)
      res.status(500).end(ssrResult.error.stack)
      return
    }

    const { template, render } = ssrResult.value
    let didError = false

    const { pipe, abort } = render(url, {
      onShellError() {
        res.status(500)
        res.set({ 'Content-Type': 'text/html' })
        res.send('<h1>Something went wrong</h1>')
      },
      onShellReady() {
        res.status(didError ? 500 : 200)
        res.set({ 'Content-Type': 'text/html' })

        const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`)
        let htmlEnded = false

        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            // See entry-server.tsx for more details of this code
            if (!htmlEnded) {
              chunk = chunk.toString()
              if (chunk.endsWith('<vite-streaming-end></vite-streaming-end>')) {
                res.write(chunk.slice(0, -41) + htmlEnd, 'utf-8')
              } else {
                res.write(chunk, 'utf-8')
              }
            } else {
              res.write(chunk, encoding)
            }
            callback()
          },
        })

        transformStream.on('finish', () => {
          res.end()
        })

        res.write(htmlStart)

        pipe(transformStream)
      },
      onError(error) {
        didError = true
        console.error(error)
      },
    })

    setTimeout(() => {
      abort()
    }, ABORT_DELAY)
  })

  return router
}

export default router
