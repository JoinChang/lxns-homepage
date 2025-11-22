import fs from 'node:fs/promises'

export const isProduction = process.env.NODE_ENV === 'production'
export const port = Number(process.env.PORT) || 5173
export const base = process.env.BASE || '/'
export const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

export const ssrConfig = {
  isProduction,
  templateHtml,
  abortDelay: 10000,
} as const
