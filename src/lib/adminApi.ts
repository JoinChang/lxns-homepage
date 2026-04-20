import type { Artist, AlbumImageProps, ArtistPlatform, FriendLink } from '@/data/common.tsx'

export type AdminArtist = Artist & { _count: { albums: number } }
export type AdminAlbum = AlbumImageProps
export type AdminFriend = FriendLink

export interface UploadResponse {
  key: string
  url: string
  ratio: number
}

function extractErrorMessage(raw: string, fallback: string): string {
  if (!raw) return fallback
  try {
    const body = JSON.parse(raw)
    if (body && typeof body.error === 'string') return body.error
  } catch {
    // 不是 JSON，直接返回文本
  }
  return raw
}

async function request<T>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init.headers,
    },
  })
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Unauthenticated')
  }
  if (!res.ok) {
    const raw = await res.text().catch(() => '')
    throw new Error(extractErrorMessage(raw, `${res.status} ${res.statusText}`))
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResponse> {
  return new Promise<UploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.withCredentials = true

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        window.location.href = '/login'
        reject(new Error('Unauthenticated'))
        return
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadResponse)
        } catch (err) {
          reject(err)
        }
      } else {
        reject(
          new Error(
            extractErrorMessage(xhr.responseText, `${xhr.status} ${xhr.statusText}`),
          ),
        )
      }
    }

    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.onabort = () => reject(new Error('上传已取消'))

    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}

export const adminApi = {
  artists: {
    list: () => request<AdminArtist[]>('/api/admin/artists'),
    create: (data: { name: string; platform?: ArtistPlatform | null; href?: string | null }) =>
      request<AdminArtist>('/api/admin/artists', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ name: string; platform: ArtistPlatform | null; href: string | null }>) =>
      request<AdminArtist>(`/api/admin/artists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<void>(`/api/admin/artists/${id}`, { method: 'DELETE' }),
  },
  friends: {
    list: () => request<AdminFriend[]>('/api/admin/friends'),
    create: (data: { name: string; description?: string; href: string; sortOrder?: number }) =>
      request<AdminFriend>('/api/admin/friends', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: Partial<{ name: string; description: string; href: string; sortOrder: number }>,
    ) =>
      request<AdminFriend>(`/api/admin/friends/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<void>(`/api/admin/friends/${id}`, { method: 'DELETE' }),
    reorder: (ids: string[]) =>
      request<void>('/api/admin/friends/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }),
  },
  albums: {
    list: () => request<AdminAlbum[]>('/api/admin/albums'),
    create: (data: {
      file: string
      url: string
      ratio: number
      date?: string | null
      artistId?: string | null
      sortOrder?: number
    }) => request<AdminAlbum>('/api/admin/albums', { method: 'POST', body: JSON.stringify(data) }),
    update: (
      id: string,
      data: Partial<{
        file: string
        url: string
        ratio: number
        date: string | null
        artistId: string | null
        sortOrder: number
      }>,
    ) => request<AdminAlbum>(`/api/admin/albums/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<void>(`/api/admin/albums/${id}`, { method: 'DELETE' }),
  },
  upload: {
    albumImage: (file: File, onProgress?: (pct: number) => void) =>
      uploadWithProgress('/api/admin/upload/album-image', file, onProgress),
    deleteAlbumImage: (key: string) =>
      request<void>(
        `/api/admin/upload/album-image?key=${encodeURIComponent(key)}`,
        { method: 'DELETE' },
      ),
  },
  db: {
    exportDownload: async () => {
      const res = await fetch('/api/admin/db/export', {
        credentials: 'include',
      })
      if (res.status === 401) {
        window.location.href = '/login'
        throw new Error('Unauthenticated')
      }
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        throw new Error(extractErrorMessage(raw, `${res.status} ${res.statusText}`))
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? `db-export-${Date.now()}.json`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
    import: (payload: unknown) =>
      request<{
        artists: number
        albums: number
        friends: number
        sourceExportedAt: string | null
      }>('/api/admin/db/import', { method: 'POST', body: JSON.stringify(payload) }),
  },
  analytics: {
    get: () =>
      request<{
        totalViews: number
        uniqueViews: number
        last24hViews: number
        last7dViews: number
        daily: { date: string; views: number }[]
        hourly: number[]
        topReferrers: { host: string; views: number }[]
        directViews: number
      }>('/api/admin/analytics'),
  },
  cos: {
    reconcile: (apply: boolean) =>
      request<{
        apply: boolean
        totalCosObjects: number
        knownUuids: number
        orphanTotal: number
        deleted: number
        failed: number
        orphansByLocation: { bucket: string; prefix: string; orphans: string[] }[]
      }>(
        `/api/admin/cos/reconcile${apply ? '?apply=1' : ''}`,
        { method: 'POST' },
      ),
  },
}
