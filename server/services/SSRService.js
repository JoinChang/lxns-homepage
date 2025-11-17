import fs from 'node:fs/promises'
import { ok, err } from 'neverthrow'

export class SSRService {
  constructor(config = {}) {
    this.isProduction = config.isProduction ?? false
    this.vite = config.vite
    this.templateHtml = config.templateHtml || ''
  }

  setVite(vite) {
    this.vite = vite
  }

  async loadTemplate(url) {
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

  async _loadDevelopmentTemplate(url) {
    if (!this.vite) {
      throw new Error('Vite server is not initialized in SSRService')
    }

    // Always read fresh template in development
    const template = await fs.readFile('./index.html', 'utf-8')
    const transformedTemplate = await this.vite.transformIndexHtml(url, template)
    const render = (await this.vite.ssrLoadModule('/src/entry-server.tsx')).render

    return ok({ template: transformedTemplate, render })
  }

  async _loadProductionTemplate() {
    const render = (await import('../../dist/server/entry-server.js')).render
    return ok({ template: this.templateHtml, render })
  }

  fixStacktrace(error) {
    this.vite?.ssrFixStacktrace(error)
  }
}
