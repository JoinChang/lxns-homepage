import { ok, err } from 'neverthrow'

const FAVICON_TIMEOUT_MS = 5000

export async function getFavicon(url: string) {
  if (!url) {
    return err(new Error('URL parameter is required'))
  }

  try {
    const faviconUrl = `https://t2.gstatic.cn/faviconV2?client=SOCIAL&url=${encodeURIComponent(url)}`
    const response = await fetch(faviconUrl, {
      signal: AbortSignal.timeout(FAVICON_TIMEOUT_MS),
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to fetch favicon: ${response.status} ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    return ok(Buffer.from(buffer))
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
