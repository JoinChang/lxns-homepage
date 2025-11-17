import fs from 'node:fs/promises'

// Environment
export const isProduction = process.env.NODE_ENV === 'production'
export const port = process.env.PORT || 5173
export const base = process.env.BASE || '/'
export const ABORT_DELAY = 10000

// Cached production assets
export const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Service configuration
export const ssrConfig = {
  isProduction,
  templateHtml,
}

export const publicServiceConfig = {
  faviconBaseUrl: 'https://t2.gstatic.cn/faviconV2',
  faviconClient: 'SOCIAL',
}
