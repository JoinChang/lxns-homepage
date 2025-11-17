import { ok, err } from 'neverthrow'

export class PublicService {
  constructor(options = {}) {
    this.faviconBaseUrl = options.faviconBaseUrl || 'https://t2.gstatic.cn/faviconV2'
    this.faviconClient = options.faviconClient || 'SOCIAL'
  }

  async fetchFavicon(url) {
    try {
      if (!url) {
        return err(new Error('URL parameter is required'))
      }

      const faviconUrl = `${this.faviconBaseUrl}?client=${this.faviconClient}&url=${encodeURIComponent(url)}`
      const response = await fetch(faviconUrl)

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to fetch favicon: ${response.status} ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      return ok(Buffer.from(buffer))
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
