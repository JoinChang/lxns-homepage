import fs from 'node:fs/promises'
import { Transform } from 'node:stream'
import type { Request, Response } from 'express'
import type { ViteDevServer } from 'vite'
import { ok, err, Result } from 'neverthrow'

interface SSRConfig {
  isProduction: boolean
  templateHtml?: string
  abortDelay?: number
}

interface SSRTemplateResult {
  template: string
  render: (url: string, ssrData: Record<string, unknown>, options: RenderOptions) => RenderResult
}

interface RenderOptions {
  onShellError: () => void
  onShellReady: () => void
  onError: (error: Error) => void
}

interface RenderResult {
  pipe: (stream: Transform) => void
  abort: () => void
}

export class SSRService {
  private isProduction: boolean
  private vite?: ViteDevServer
  private templateHtml: string
  private abortDelay: number

  constructor(config: SSRConfig) {
    this.isProduction = config.isProduction
    this.templateHtml = config.templateHtml || ''
    this.abortDelay = config.abortDelay || 10000
  }

  setVite(vite: ViteDevServer): void {
    this.vite = vite
  }

  async loadTemplate(url: string): Promise<Result<SSRTemplateResult, Error>> {
    try {
      if (!this.isProduction) {
        return await this._loadDevelopmentTemplate(url)
      } else {
        return await this._loadProductionTemplate()
      }
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async handleSSRRequest(
    req: Request,
    res: Response,
    base: string = '/',
    ssrData: Record<string, unknown> = {},
  ): Promise<void> {
    const url = req.originalUrl.replace(base, '')

    const ssrResult = await this.loadTemplate(url)

    if (ssrResult.isErr()) {
      this.fixStacktrace(ssrResult.error)
      console.error('SSR template load error:', ssrResult.error.message)
      console.error(ssrResult.error.stack)
      res.status(500).end(ssrResult.error.stack)
      return
    }

    const { template, render } = ssrResult.value
    let didError = false

    const { pipe, abort } = render(url, ssrData, {
      onShellError: () => {
        res.status(500)
        res.set({ 'Content-Type': 'text/html' })
        res.send('<h1>Something went wrong</h1>')
      },
      onShellReady: () => {
        res.status(didError ? 500 : 200)
        res.set({ 'Content-Type': 'text/html' })

        const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`)
        const payload = `<script>window.__SSR_DATA__ = ${JSON.stringify(ssrData).replace(/</g, '\\u003c')};</script>`
        const htmlStartWithData = htmlStart + payload

        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            const chunkStr = chunk.toString()

            // 约定的流结束标记，见 entry-server.tsx
            if (chunkStr.endsWith('<vite-streaming-end></vite-streaming-end>')) {
              res.write(chunkStr.slice(0, -41) + htmlEnd, 'utf-8')
            } else {
              res.write(chunk, encoding)
            }
            callback()
          },
        })

        transformStream.on('finish', () => {
          res.end()
        })

        res.write(htmlStartWithData)
        pipe(transformStream)
      },
      onError: (error: Error) => {
        didError = true
        console.error('SSR render error:', error)
      },
    })

    setTimeout(() => {
      abort()
    }, this.abortDelay)
  }

  fixStacktrace(error: Error): void {
    this.vite?.ssrFixStacktrace(error)
  }

  private async _loadDevelopmentTemplate(url: string): Promise<Result<SSRTemplateResult, Error>> {
    if (!this.vite) {
      return err(new Error('Vite server is not initialized in SSRService'))
    }

    const template = await fs.readFile('./index.html', 'utf-8')
    const transformedTemplate = await this.vite.transformIndexHtml(url, template)
    const render = (await this.vite.ssrLoadModule('/src/entry-server.tsx')).render

    return ok({ template: transformedTemplate, render })
  }

  private async _loadProductionTemplate(): Promise<Result<SSRTemplateResult, Error>> {
    const render = (await import('../../dist/server/entry-server.js')).render
    return ok({ template: this.templateHtml, render })
  }
}
