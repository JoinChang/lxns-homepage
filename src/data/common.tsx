export type ArtistPlatform = 'BILIBILI' | 'TWITTER' | 'WEIBO' | 'PIXIV' | 'OTHER'

export interface Artist {
  id: string
  name: string
  platform: ArtistPlatform | null
  href: string | null
}

export interface AlbumImageProps {
  id: string
  file: string
  url: string
  ratio: number
  date: string | null
  artist: Artist | null
  sortOrder?: number
}

export interface FriendLink {
  id: string
  name: string
  description: string
  href: string
  sortOrder?: number
}
