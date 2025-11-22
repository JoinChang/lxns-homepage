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
  render: (url: string, options: RenderOptions) => RenderResult
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

  async handleSSRRequest(req: Request, res: Response, base: string = '/'): Promise<void> {
    const url = req.originalUrl.replace(base, '')
    
    // Load template and render function
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

    // Render React app with streaming
    const { pipe, abort } = render(url, {
      onShellError: () => {
        res.status(500)
        res.set({ 'Content-Type': 'text/html' })
        res.send('<h1>Something went wrong</h1>')
      },
      onShellReady: () => {
        res.status(didError ? 500 : 200)
        res.set({ 'Content-Type': 'text/html' })

        const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`)
        
        // Transform stream to inject HTML template parts
        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            const chunkStr = chunk.toString()
            
            // Check for streaming end marker (see entry-server.tsx)
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

        // Write HTML head and start streaming
        res.write(htmlStart)
        pipe(transformStream)
      },
      onError: (error: Error) => {
        didError = true
        console.error('SSR render error:', error)
      },
    })

    // Set timeout to abort long-running renders
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

    // Always read fresh template in development
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
